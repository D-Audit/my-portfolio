import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import sr from '@utils/sr';
import { srConfig } from '@config';
import { usePrefersReducedMotion } from '@hooks';

const certificates = [
  {
    name: 'Python',
    issuer: 'Kaggle Learn',
    detail: 'Completed 31 May 2026',
    image: '/certificates/kaggle-python-certificate.png',
  },
  {
    name: 'Pandas',
    issuer: 'Kaggle Learn',
    detail: 'Completed 3 June 2026',
    image: '/certificates/kaggle-pandas-certificate.png',
  },
  {
    name: 'Certificate of Merit — Money Makeover Challenge',
    issuer: 'iDebate Rwanda, Money Makeover & BK Foundation',
    detail: 'Outstanding participant recognition',
    image: '/certificates/money-makeover-certificate-of-merit.png',
  },
];

const StyledCertificatesGrid = styled.ul`
  ${({ theme }) => theme.mixins.resetList};

  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 25px;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const StyledCertificate = styled.li`
  ${({ theme }) => theme.mixins.boxShadow};

  overflow: hidden;
  border-radius: var(--border-radius);
  background-color: var(--light-navy);
  transition: var(--transition);

  &:hover,
  &:focus-within {
    transform: translateY(-6px);
  }

  .certificate-image {
    display: block;
    overflow: hidden;
    background-color: var(--white);

    &:hover,
    &:focus {
      .img {
        transform: scale(1.03);
      }
    }
  }

  .img {
    display: block;
    width: 100%;
    aspect-ratio: 1.75 / 1;
    object-fit: cover;
    transition: var(--transition);
  }

  .certificate-content {
    padding: 22px 25px 25px;
  }

  .certificate-issuer {
    margin: 0 0 7px;
    color: var(--green);
    font-family: var(--font-mono);
    font-size: var(--fz-xs);
  }

  h3 {
    margin: 0 0 6px;
    color: var(--lightest-slate);
    font-size: var(--fz-xl);
  }

  .certificate-date {
    margin: 0 0 17px;
    color: var(--light-slate);
    font-family: var(--font-mono);
    font-size: var(--fz-xxs);
  }

  .view-certificate {
    ${({ theme }) => theme.mixins.inlineLink};
    font-family: var(--font-mono);
    font-size: var(--fz-xs);
  }
`;

const Certificates = () => {
  const revealTitle = useRef(null);
  const revealCertificates = useRef([]);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    sr.reveal(revealTitle.current, srConfig());
    revealCertificates.current.forEach((ref, i) => sr.reveal(ref, srConfig(i * 100)));
  }, []);

  return (
    <section id="certificates">
      <h2 className="numbered-heading" ref={revealTitle}>
        Certificates
      </h2>

      <StyledCertificatesGrid>
        {certificates.map(({ name, issuer, detail, image }, i) => (
          <StyledCertificate key={name} ref={el => (revealCertificates.current[i] = el)}>
            <a
              className="certificate-image"
              href={image}
              target="_blank"
              rel="noreferrer"
              aria-label={`View ${name} certificate`}>
              <img
                className="img"
                src={image}
                alt={`${name} certificate from ${issuer}`}
                loading="lazy"
              />
            </a>

            <div className="certificate-content">
              <p className="certificate-issuer">{issuer}</p>
              <h3>{name}</h3>
              <p className="certificate-date">{detail}</p>
              <a className="view-certificate" href={image} target="_blank" rel="noreferrer">
                View certificate
              </a>
            </div>
          </StyledCertificate>
        ))}
      </StyledCertificatesGrid>
    </section>
  );
};

export default Certificates;
