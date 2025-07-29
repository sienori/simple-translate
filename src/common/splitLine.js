import React from "react";

export default (text) => {
    const regex = /(\n)/g;
    return text.split(regex).map((line, i) => (line.match(regex) ? <br key={i} /> : line));
};
