// Help Links at the top of the page

import React from "react";
import { Button } from "@chakra-ui/react";

import { FaDiscord } from "react-icons/fa";

import "./helpBar.css"

function HelpBar() {
    return (
        <div className="top-buttons">
            <Button onClick={() => window.open('https://pkm.canny.io/bugs-and-feature-requests')}>Submit Feedback</Button>
            <Button onClick={() => window.open('https://discord.gg/RUSuQCev')}><FaDiscord /></Button>
        </div>
    );
}

export default HelpBar;