import React from "react";
import Link from "next/link";

export default function NavBar() {
    return (
        <>
            <nav>
                <div>
                    <div className="Blue"></div>
                    <h1>Username</h1>
                </div>
                <div>
                    <h1>You have debt!</h1>
                </div>
                <div>
                    <p>dropdown</p>
                </div>
            </nav>
        </>
    );
}