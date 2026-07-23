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

  // Define custom sort order for projects as arranged in the database
  const PROJECT_ORDER = [
    "Examora",
    "Agrigorithm",
    "Personal Website",
    "Profile-UP",
    "HORA",
    "Gdrive File Links",
    "Whack-A-Mole",
    "DataCamp Projects",
    "Ocean Related Programs"
  ];

  // Sort projects within each category
  Object.keys(groupedProjects).forEach(category => {
    groupedProjects[category].sort((a: any, b: any) => {
      const ai = PROJECT_ORDER.indexOf(a.name);
      const bi = PROJECT_ORDER.indexOf(b.name);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return 0;
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
