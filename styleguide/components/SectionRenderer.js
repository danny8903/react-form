import React from 'react';

// Import default implementation from react-styleguidist using the full path
import DefaultSectionRenderer from 'react-styleguidist/lib/client/rsg-components/Section/SectionRenderer';

export function SectionRenderer({ name, ...props }) {
  return <DefaultSectionRenderer {...props} />;
}

export default SectionRenderer;
