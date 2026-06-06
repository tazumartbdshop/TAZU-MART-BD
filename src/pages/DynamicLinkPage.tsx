import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { siteManagementService, LinkPage } from '../services/siteManagementService';

const DynamicLinkPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<LinkPage | null | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      setPage(undefined);
      const foundPage = await siteManagementService.getLinkPageBySlug(slug || '');
      setPage(foundPage);
    };
    fetchData();
  }, [slug]);

  if (page === undefined) {
    return <div className="container mx-auto py-20 text-center text-xl font-bold">Loading...</div>;
  }

  if (!page || !page.enabled) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-3xl font-black mb-4">Content Not Available Yet</h2>
        <p className="text-neutral-500">The page you are looking for might be temporarily disabled or doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl" style={{ backgroundColor: page.backgroundColor }}>
      <h1 className="text-4xl font-black uppercase tracking-widest mb-8" style={{ color: page.titleColor }}>{page.title}</h1>
      {page.banner && (
        <img src={page.banner} alt={page.title} className="w-full h-64 object-cover mb-8" />
      )}
      <div 
        className="prose prose-lg max-w-none" 
        style={{ color: page.contentColor, fontSize: page.fontSize }}
        dangerouslySetInnerHTML={{ __html: page.content }} 
      />
    </div>
  );
};

export default DynamicLinkPage;
