import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { srConfig, email, phone } from '@config';
import sr from '@utils/sr';
import { usePrefersReducedMotion } from '@hooks';

const StyledContactSection = styled.section`
  max-width: 600px;
  margin: 0 auto 100px;
  text-align: center;

  @media (max-width: 768px) {
    margin: 0 auto 50px;
  }

  .overline {
    display: block;
    margin-bottom: 20px;
    color: var(--green);
    font-family: var(--font-mono);
    font-size: var(--fz-md);
    font-weight: 400;

    &:before {
      bottom: 0;
      font-size: var(--fz-sm);
    }

    &:after {
      display: none;
    }
  }

  .title {
    font-size: clamp(40px, 5vw, 60px);
  }

  .email-link {
    ${({ theme }) => theme.mixins.bigButton};
    margin-top: 50px;
  }

  .contact-options {
    margin-top: 18px;
    font-family: var(--font-mono);
    font-size: var(--fz-sm);

    a {
      color: var(--green);

      &:hover,
      &:focus {
        color: var(--green-tint);
      }
    }
  }
`;

const Contact = () => {
  const revealContainer = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    sr.reveal(revealContainer.current, srConfig());
  }, []);

  return (
    <StyledContactSection id="contact" ref={revealContainer}>
      <h2 className="numbered-heading overline">What’s Next?</h2>

      <h2 className="title">Get In Touch</h2>

      <p>
        I am always open to discussing software, AI, and meaningful opportunities. Whether you
        have a project in mind, a question, or simply want to connect, feel free to reach out.
      </p>

      <a className="email-link" href={`mailto:${email}`}>
        Email Me
      </a>

      <p className="contact-options">
        <a href={`tel:${phone}`}>Call: +250 795 822 174</a>
        {' · '}
        <a href="https://wa.me/250795822174" target="_blank" rel="noopener noreferrer">
          WhatsApp
        </a>
      </p>
    </StyledContactSection>
  );
};

export default Contact;
