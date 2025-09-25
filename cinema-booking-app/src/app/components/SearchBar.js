"use client";

import { TextField } from "@mui/material";
import { useEffect } from "react";
import { useState } from "react";

const SearchBar = (prop) => {
  const [val, setVal] = useState(prop.query);

useEffect(() => {
  prop.setVal(val);
}, [val]); // only run when val changes

  return (
    <div className="search">
      <TextField
        id="search-bar"
        variant="outlined"
        placeholder="Search..."
        value={val}
        fullWidth
        onChange={(event) => {
          setVal(event.target.value);
          prop.setVal(val);
        }}
      />
    </div>
  );
};

export default SearchBar;
