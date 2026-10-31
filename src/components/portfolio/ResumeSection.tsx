import React from 'react';
import type {
  ProfileDTO,
  EducationDTO,
  ExperienceDTO,
  SkillDTO,
  AchievementDTO,
} from '@/types/portfolio';
import { IonIcon } from '@/components/ui/IonIcon';

interface ResumeSectionProps {
  isActive: boolean;
  profile: ProfileDTO;
  education: EducationDTO[];
  experience: ExperienceDTO[];
  skills: SkillDTO[];
  achievements: AchievementDTO[];
}

export function ResumeSection({
  isActive,
  profile,
  education,
  experience,
  skills,
  achievements,
}: ResumeSectionProps) {
  const visibleEducation = [...education]
    .filter((item) => item.visible)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const visibleExperience = [...experience]
    .filter((item) => item.visible)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const visibleSkills = [...skills]
    .filter((item) => item.visible)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const publishedAchievements = [...achievements]
    .filter((item) => item.status === 'published')
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <article
      className={`resume${isActive ? ' active' : ''}`}
      data-page="resume"
    >
      <header>
        <h2 className="h2 article-title">{profile.resumeHeading}</h2>
      </header>

      <section className="timeline">
        <div className="title-wrapper">
          <div className="icon-box">
            <IonIcon name="book-outline" />
          </div>

          <h3 className="h3">{profile.educationHeading}</h3>
        </div>

        <ol className="timeline-list">
          {visibleEducation.map((item) => (
            <li key={item.id} className="timeline-item">
              <h4 className="h4 timeline-item-title">{item.institution}</h4>
              <span>{item.dateRange}</span>
              <p className="timeline-text">{item.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="timeline">
        <div className="title-wrapper">
          <div className="icon-box">
            <IonIcon name="book-outline" />
          </div>

          <h3 className="h3">{profile.experienceHeading}</h3>
        </div>

        <ol className="timeline-list">
          {visibleExperience.map((item) => (
            <li key={item.id} className="timeline-item">
              <h4 className="h4 timeline-item-title">{item.position}</h4>
              <span>{item.dateRange}</span>
              <p className="timeline-text">{item.description}</p>
            </li>
          ))}
        </ol>
      </section>

      {publishedAchievements.length > 0 && (
        <section className="timeline">
          <div className="title-wrapper">
            <div className="icon-box">
              <IonIcon name="book-outline" />
            </div>

            <h3 className="h3">Achievements</h3>
          </div>

          <ol className="timeline-list">
            {publishedAchievements.map((item) => (
              <li key={item.id} className="timeline-item">
                <h4 className="h4 timeline-item-title">
                  {item.title}
                  {item.issuer ? ` — ${item.issuer}` : ''}
                </h4>
                <span>{item.dateDisplay}</span>
                <p className="timeline-text">{item.description}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="skill">
        <h3 className="h3 skills-title">{profile.skillsHeading}</h3>

        <ul className="skills-list content-card">
          {visibleSkills.map((skill) => (
            <li key={skill.id} className="skills-item">
              <div className="title-wrapper">
                <h5 className="h5">{skill.name}</h5>
                <data value={skill.percentageValue}>
                  {skill.percentageLabel}
                </data>
              </div>

              <div className="skill-progress-bg">
                <div
                  className="skill-progress-fill"
                  style={{ width: `${skill.percentageValue}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
