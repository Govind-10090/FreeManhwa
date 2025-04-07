import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Categories from './components/Categories';
import Favorites from './pages/Favorites';
import ManhuaDetails from './pages/ManhuaDetails';
import SearchResults from './pages/SearchResults';
import CategoryPage from './pages/CategoryPage';

export default function App() {
    return (
        <div className="min-h-screen">
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/category/:categoryId" element={<CategoryPage />} />
                <Route path="/manga/:id" element={<ManhuaDetails />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
} 