import React from 'react';

export default function PublicLoading() {
  return (
    <main aria-busy="true" aria-label="Loading portfolio">
      <aside className="sidebar" />
      <div className="main-content">
        <article className="about active" />
      </div>
    </main>
  );
}
