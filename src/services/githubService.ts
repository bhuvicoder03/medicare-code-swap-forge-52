
import { FileItem } from '@/components/FileExplorer';
import { toast } from 'sonner';

// Function to parse GitHub repository information from URL
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const githubUrl = new URL(url);
    const pathParts = githubUrl.pathname.split('/').filter(Boolean);

    if (pathParts.length >= 2) {
      return { owner: pathParts[0], repo: pathParts[1] };
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Simulated function to fetch repository contents
export async function fetchRepositoryContents(
  repoUrl: string, 
  branch: string
): Promise<FileItem[]> {
  try {
    const repoInfo = parseGitHubUrl(repoUrl);
    
    if (!repoInfo) {
      throw new Error('Invalid GitHub repository URL');
    }
    
    // In a real implementation, this would make an API call to GitHub
    // For now, we'll return mock data for simulation
    return simulateRepositoryStructure();
    
  } catch (error) {
    console.error('Error fetching repository contents:', error);
    toast.error('Failed to fetch repository contents');
    throw error;
  }
}

// Simulated function to fetch file content
export async function fetchFileContent(
  repoUrl: string,
  filePath: string,
  branch: string
): Promise<string> {
  try {
    const repoInfo = parseGitHubUrl(repoUrl);
    
    if (!repoInfo) {
      throw new Error('Invalid GitHub repository URL');
    }
    
    // In a real implementation, this would make an API call to GitHub
    // For now, we'll return mock data for simulation
    return simulateFileContent(filePath);
    
  } catch (error) {
    console.error('Error fetching file content:', error);
    toast.error('Failed to fetch file content');
    throw error;
  }
}

// Function to import file (simulated)
export async function importFile(
  repoUrl: string, 
  filePath: string, 
  content: string
): Promise<boolean> {
  try {
    // In a real implementation, this would integrate with your project/file system
    // For now, we'll just simulate a successful import
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  } catch (error) {
    console.error('Error importing file:', error);
    toast.error('Failed to import file');
    return false;
  }
}

// Mock data functions
function simulateRepositoryStructure(): FileItem[] {
  return [
    {
      name: 'src',
      path: 'src',
      type: 'directory',
      children: [
        {
          name: 'components',
          path: 'src/components',
          type: 'directory',
          children: [
            {
              name: 'Header.tsx',
              path: 'src/components/Header.tsx',
              type: 'file'
            },
            {
              name: 'Footer.tsx',
              path: 'src/components/Footer.tsx',
              type: 'file'
            }
          ]
        },
        {
          name: 'pages',
          path: 'src/pages',
          type: 'directory',
          children: [
            {
              name: 'Home.tsx',
              path: 'src/pages/Home.tsx',
              type: 'file'
            },
            {
              name: 'About.tsx',
              path: 'src/pages/About.tsx',
              type: 'file'
            }
          ]
        },
        {
          name: 'App.tsx',
          path: 'src/App.tsx',
          type: 'file'
        },
        {
          name: 'index.tsx',
          path: 'src/index.tsx',
          type: 'file'
        }
      ]
    },
    {
      name: 'public',
      path: 'public',
      type: 'directory',
      children: [
        {
          name: 'index.html',
          path: 'public/index.html',
          type: 'file'
        },
        {
          name: 'favicon.ico',
          path: 'public/favicon.ico',
          type: 'file'
        }
      ]
    },
    {
      name: 'package.json',
      path: 'package.json',
      type: 'file'
    },
    {
      name: 'README.md',
      path: 'README.md',
      type: 'file'
    }
  ];
}

function simulateFileContent(filePath: string): string {
  const fileContents: Record<string, string> = {
    'src/App.tsx': `import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;`,

    'src/components/Header.tsx': `import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="header">
      <div className="logo">RI Medicare</div>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/services">Services</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;`,

    'src/components/Footer.tsx': `import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; 2023 RI Medicare. All rights reserved.</p>
        <div className="footer-links">
          <a href="/terms">Terms of Service</a>
          <a href="/privacy">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;`,

    'src/pages/Home.tsx': `import React from 'react';

const Home = () => {
  return (
    <div className="home-page">
      <section className="hero">
        <h1>Welcome to RI Medicare</h1>
        <p>Providing quality healthcare services for Rhode Island residents</p>
        <button className="cta-button">Learn More</button>
      </section>
      
      <section className="services-overview">
        <h2>Our Services</h2>
        <div className="service-grid">
          <div className="service-card">
            <h3>Insurance Coverage</h3>
            <p>Comprehensive coverage options for your healthcare needs</p>
          </div>
          <div className="service-card">
            <h3>Provider Network</h3>
            <p>Access to top healthcare providers across Rhode Island</p>
          </div>
          <div className="service-card">
            <h3>Prescription Benefits</h3>
            <p>Affordable medication coverage and pharmacy options</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;`,

    'src/pages/About.tsx': `import React from 'react';

const About = () => {
  return (
    <div className="about-page">
      <h1>About RI Medicare</h1>
      <p>
        RI Medicare is dedicated to providing high-quality healthcare services
        to Rhode Island residents. With over 20 years of experience in the
        healthcare industry, we strive to make healthcare accessible and
        affordable for all.
      </p>
      
      <section className="mission-vision">
        <div className="mission">
          <h2>Our Mission</h2>
          <p>
            To improve the health and well-being of Rhode Island communities
            through accessible, affordable, and quality healthcare services.
          </p>
        </div>
        
        <div className="vision">
          <h2>Our Vision</h2>
          <p>
            To be the leading healthcare provider in Rhode Island, recognized
            for excellence in patient care and community service.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;`,

    'package.json': `{
  "name": "ri-medicare",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.1",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}`,

    'README.md': `# RI Medicare Web Application

## Overview
This is the official repository for the RI Medicare web application, designed to provide information and services related to Medicare in Rhode Island.

## Features
- Information about Medicare plans
- Provider directory
- Coverage details
- Contact information
- Enrollment assistance

## Getting Started
1. Clone this repository
2. Run \`npm install\` to install dependencies
3. Run \`npm start\` to start the development server
4. Open \`http://localhost:3000\` in your browser

## Contributing
Please read our contributing guidelines before submitting pull requests.

## License
This project is licensed under the MIT License.`
  };

  // Return the content for the requested file, or a placeholder if not found
  return fileContents[filePath] || `// Content for ${filePath} not available in the simulation`;
}
