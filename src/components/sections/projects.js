import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import sr from '@utils/sr';
import { srConfig } from '@config';
import { Icon } from '@components/icons';
import { usePrefersReducedMotion } from '@hooks';

const projects = [
  {
    title: 'PocketSave',
    description:
      'A Flutter and Dart platform that modernizes Rwanda\'s ikimina savings groups with member registration, contribution tiers, financial-health assessment, debt-protection alerts, and USSD support.',
    tech: ['Flutter', 'Dart', 'Mobile & Web'],
    github: 'https://github.com/D-Audit/pocket_save',
  },
  {
    title: 'Inventory Management',
    description:
      'A RESTful inventory management system for managing products, stock levels, and everyday inventory operations.',
    tech: ['REST API', 'Backend', 'Frontend'],
    github: 'https://github.com/D-Audit/inventory-management',
  },
  {
    title: 'Personal Portfolio',
    description:
      'My personal portfolio website showcasing my software engineering, AI/ML work, professional experience, and projects.',
    tech: ['Gatsby', 'React', 'Styled Components'],
    github: 'https://github.com/D-Audit/my-portfolio',
  },
];

const StyledProjectsGrid = styled.ul`
  ${({ theme }) => theme.mixins.resetList};

  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 15px;
  position: relative;

  @media (max-width: 1080px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const StyledProject = styled.li`
  ${({ theme }) => theme.mixins.boxShadow};

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  min-height: 300px;
  padding: 2rem 1.75rem;
  border-radius: var(--border-radius);
  background-color: var(--light-navy);
  transition: var(--transition);

  &:hover,
  &:focus-within {
    transform: translateY(-7px);
  }

  .project-top {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
  }

  .project-folder {
    color: var(--green);

    svg {
      width: 40px;
      height: 40px;
    }
  }

  .project-links {
    display: flex;
    align-items: center;
    margin-right: -10px;
    color: var(--light-slate);

    a {
      display: flex;
      padding: 10px;

      svg {
        width: 22px;
        height: 22px;
      }
    }
  }

  .project-title {
    margin: 0 0 10px;
    color: var(--lightest-slate);
    font-size: var(--fz-xxl);

    a {
      color: inherit;

      &:before {
        content: '';
        position: absolute;
        z-index: 0;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
      }
    }
  }

  .project-description {
    color: var(--light-slate);
    font-size: 17px;
  }

  .project-tech-list {
    display: flex;
    flex-wrap: wrap;
    margin: 20px 0 0;
    padding: 0;
    list-style: none;

    li {
      margin: 0 15px 5px 0;
      color: var(--light-slate);
      font-family: var(--font-mono);
      font-size: var(--fz-xxs);
      line-height: 1.75;
    }
  }
`;

const Projects = () => {
  const revealTitle = useRef(null);
  const revealProjects = useRef([]);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    sr.reveal(revealTitle.current, srConfig());
    revealProjects.current.forEach((ref, i) => sr.reveal(ref, srConfig(i * 100)));
  }, []);

  return (
    <section id="other-projects">
      <h2 className="numbered-heading" ref={revealTitle}>
        Other Projects I've Built
      </h2>

      <StyledProjectsGrid>
        {projects.map(({ title, description, tech, github }, i) => (
          <StyledProject key={title} ref={el => (revealProjects.current[i] = el)}>
            <div>
              <div className="project-top">
                <div className="project-folder">
                  <Icon name="Folder" />
                </div>
                <div className="project-links">
                  <a
                    href={github}
                    aria-label={`${title} GitHub repository`}
                    target="_blank"
                    rel="noreferrer">
                    <Icon name="GitHub" />
                  </a>
                </div>
              </div>

              <h3 className="project-title">
                <a href={github} target="_blank" rel="noreferrer">
                  {title}
                </a>
              </h3>
              <p className="project-description">{description}</p>
            </div>

            <ul className="project-tech-list">
              {tech.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </StyledProject>
        ))}
      </StyledProjectsGrid>
    </section>
  );
};

export default Projects;
