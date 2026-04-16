import React, { useState, useEffect } from "react";
import axios from "axios";

const Products = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3000/products").then(res => setData(res.data));
  }, []);

  return (
    <div style={{ padding: "40px", color: "white" }}>
      <h1>Inventory Catalogue</h1>
      <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #3498db" }}>
            <th>ID</th>
            <th>Brand</th>
            <th>Product Name</th>
            <th>Size</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item.ProductID} style={{ borderBottom: "1px solid #444" }}>
              <td>{item.ProductID}</td>
              <td>{item.Brand}</td>
              <td>{item.ProductName}</td>
              <td>{item.Size}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Products;