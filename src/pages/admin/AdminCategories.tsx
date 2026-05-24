import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CategoryList from './CategoryList';
import AddCategory from './AddCategory';

export default function AdminCategories() {
  return (
    <Routes>
      <Route path="/" element={<CategoryList />} />
      <Route path="/add" element={<AddCategory />} />
      <Route path="/edit/:id" element={<AddCategory />} />
    </Routes>
  );
}
