import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Categories from './pages/Categories';
import Favorites from './pages/Favorites';
import ManhuaDetails from './pages/ManhuaDetails';
import ChapterReader from './components/ChapterReader';
import SearchResults from './pages/SearchResults';

export default function App() {
    return (
        <div className="min-h-screen">
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/manga/:id" element={<ManhuaDetails />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/read/:chapterId" element={<ChapterReader />} />
            </Routes>
        </div>
    );
} 