import React from "react";
import { createBrowserRouter } from "react-router-dom";
import Home from "../components/Home";

export const route = createBrowserRouter([
    {
        path:'/',element:(
            <div>
                <Home></Home>
            </div>
        )
    },
    
])