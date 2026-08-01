import { getProjects } from '@/lib/notion';
import { ProjectSection } from '@/components/project-section';

export const revalidate = 60;

export default async function ProjectsPage() {
  const projects = await getProjects();

  // Group projects by category
  const groupedProjects = projects.reduce((acc: any, project: any) => {
    const category = project.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(project);
    return acc;
  }, {});

  // Sort projects within each category by their arrangement number from the database
  Object.keys(groupedProjects).forEach(category => {
    groupedProjects[category].sort((a: any, b: any) => {
      const aVal = a.arrangement;
      const bVal = b.arrangement;
      
      if (aVal !== null && bVal !== null) {
        return aVal - bVal;
      }
      if (aVal !== null) return -1;
      if (bVal !== null) return 1;
      
      // Fallback to alphabetical sorting if arrangement is missing
      return a.name.localeCompare(b.name);
    });
  });

  // Define category layout sorting order
  const CATEGORY_ORDER = ['Design & Development', 'Data Science'];
  const categories = Object.keys(groupedProjects).sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a);
    const bi = CATEGORY_ORDER.indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="flex flex-col gap-12 w-full max-w-2xl mx-auto pt-0 pb-8">
      {projects.length === 0 ? (
        <p className="text-muted-foreground text-sm">No projects found. Add some in Notion!</p>
      ) : (
        <div className="flex flex-col gap-14">
          {categories.map((category) => (
            <ProjectSection 
              key={category} 
              title={category} 
              projects={groupedProjects[category]} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
