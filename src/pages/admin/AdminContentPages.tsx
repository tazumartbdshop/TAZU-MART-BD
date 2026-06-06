import React, { useState, useEffect } from 'react';
import { siteManagementService, LinkPage } from '../../services/siteManagementService';

const AdminContentPages = () => {
  const [pages, setPages] = useState<LinkPage[]>([]);

  useEffect(() => {
    siteManagementService.getLinkPages().then(setPages);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-black mb-6">Content Pages Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map(page => (
          <div key={page.id} className="border p-4 bg-white shadow-sm">
            <h3 className="font-bold">{page.title}</h3>
            <p className="text-xs text-neutral-500 mb-4">Slug: {page.slug}</p>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-black text-white text-xs">Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminContentPages;
