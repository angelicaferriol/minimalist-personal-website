import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

const projects = [
  {
    name: "Examora",
    description: "online examination system",
    link: "https://github.com/angelicaferriol/online-examination-system"
  },
  {
    name: "Agrigorithm",
    description: "from farm to your home",
    link: "#"
  },
  {
    name: "Profile-Up",
    description: "leave reviews to your professors",
    link: "https://www.figma.com/proto/Epuw9aNAgagVt7IxIBdyfs/-HCI--PROFILE-UP?node-id=132-1268&t=AqLxRmLSiR7xylPP-1"
  },
  {
    name: "Hora",
    description: "manage your schedule better",
    link: "https://www.figma.com/proto/NZWx3t0zp7M2BYUYGWsmp4/Appdev---Webdev?node-id=0-1&t=AqLxRmLSiR7xylPP-1"
  }
];

export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {projects.map((project, idx) => {
          const isExternal = project.link.startsWith("http");
          return (
            <Link 
              key={idx} 
              href={project.link}
              target={isExternal ? "_blank" : undefined}
              className="group flex flex-col justify-between p-5 border border-border rounded-xl hover:bg-muted/30 transition-colors h-32"
            >
              <div className="flex flex-col gap-1">
                <h3 className="font-medium text-foreground flex items-center gap-1.5">
                  {project.name}
                  {isExternal && (
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300 text-muted-foreground" />
                  )}
                </h3>
                {project.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
