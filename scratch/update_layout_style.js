const fs = require('fs');
const filePath = '/Users/nhannt/Desktop/desktop/project/GoStay/front_end/src/app/host/layout.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const oldNavDesktop = `<nav className="hidden lg:flex items-center justify-center gap-2 w-2/4">
          {navLinks.map((link) => {
            const isActive = link.match ? pathname.startsWith(link.match) : pathname === link.href;
            return (
              <Link 
                key={link.href}
                href={link.href} 
                className={\`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all \${
                  isActive 
                    ? "bg-gray-100 text-gray-900 shadow-sm" 
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }\`}
              >
                <link.icon className={\`h-4 w-4 \${isActive ? "text-app-primary" : ""}\`} />
                {link.name}
              </Link>
            );
          })}
        </nav>`;

const newNavDesktop = `<nav className="hidden lg:flex items-center justify-center gap-6 h-full w-2/4">
          {navLinks.map((link) => {
            const isActive = link.match ? pathname.startsWith(link.match) : pathname === link.href;
            return (
              <Link 
                key={link.href}
                href={link.href} 
                className={\`flex items-center gap-2 h-full border-b-2 text-sm font-medium transition-colors \${
                  isActive 
                    ? "border-app-primary text-app-primary" 
                    : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
                }\`}
              >
                <link.icon className="h-4 w-4" />
                {link.name}
              </Link>
            );
          })}
        </nav>`;

content = content.replace(oldNavDesktop, newNavDesktop);
fs.writeFileSync(filePath, content);
console.log("Layout style updated.");
