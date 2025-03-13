import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-primary text-white py-8">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                        <h3 className="text-xl font-bold">Manhwa Reader</h3>
                        <p className="text-sm mt-2">Read your favorite manhwa anytime, anywhere.</p>
                    </div>
                    <div className="text-sm">
                        <p>&copy; {new Date().getFullYear()} Manhwa Reader. All rights reserved.</p>
                        <p className="mt-1">Powered by MangaDex API</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
