import React from "react";
import Link from "next/link";

export default function NavBar() {
    return (
        <>
            <header className="p-3 text-bg-dark .bg-dark">
                <div className="container">
                    <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
                        <div>
                            <p>logo</p>
                            <p>Username</p>
                        </div>
                        
                        <p>Debt Status</p>

                        <div className="text-end">
                            <p>dropdown</p>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
}