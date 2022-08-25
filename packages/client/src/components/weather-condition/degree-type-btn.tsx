import React from "react";
import { DegreeType } from "./weather-condition.types";

const DegreeTypeBtn = ({ ctx, type, text }: DegreeTypeBtnProps) => {
    return (
        <button
            className="wc__degree-type-btn"
            data-emphasize={ctx.helper.shouldEmphasize(type)}
            onClick={ctx.actions.toggleDegreeType}
        >
            {text}
        </button>
    );
};

interface DegreeTypeBtnProps {
    ctx: {
        helper: {
            shouldEmphasize: (degreeType: DegreeType) => boolean;
        };
        actions: {
            toggleDegreeType: () => void;
        };
    };
    type: DegreeType;
    text: string;
}

export default DegreeTypeBtn;
