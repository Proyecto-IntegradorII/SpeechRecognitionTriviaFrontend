import react from 'react';
import StickyNavbar from './stickyNavbar';
import { Outlet } from 'react-router-dom';

export default function Layout () {
    return (
        <div>
            <StickyNavbar />

            <Outlet/>
        </div>
        
    )
}