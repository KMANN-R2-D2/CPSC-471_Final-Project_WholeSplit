import React, { useEffect, useState } from "react";
import axios from "axios";

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ 
    ProductName: "", 
    Brand: "", 
    BulkSize: "", 
    BulkAmount: "" 
  });

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.Role === "Admin";

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:3000/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  // --- RESTORED DELETE LOGIC ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      // Simple delete call since we removed the backend role-check crash
      await axios.delete(`http://localhost:3000/products/${id}`);
      fetchProducts(); // Refresh list after successful delete
    } catch (err) { 
      const msg = err.response?.data?.message || "Delete failed";
      alert(msg); 
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      // Sends all 4 fields: ProductName, Brand, BulkSize, BulkAmount
      await axios.post("http://localhost:3000/products", newProduct);
      setNewProduct({ ProductName: "", Brand: "", BulkSize: "", BulkAmount: "" });
      fetchProducts();
    } catch (err) { 
      console.log(err);
      alert("Error adding product. Check server console.");
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Segoe UI, sans-serif" }}>
      <h1>Product Catalog</h1>

      {/* ADMIN ADD FORM */}
      {isAdmin && (
        <form onSubmit={handleAdd} style={formStyle}>
          <h3>Add New Product</h3>
          <input type="text" placeholder="Product Name" value={newProduct.ProductName} 
            onChange={e => setNewProduct({...newProduct, ProductName: e.target.value})} required style={inputStyle}/>
          
          <input type="text" placeholder="Brand" value={newProduct.Brand} 
            onChange={e => setNewProduct({...newProduct, Brand: e.target.value})} required style={inputStyle}/>
          
          <input type="number" placeholder="Bulk Size" value={newProduct.BulkSize} 
            onChange={e => setNewProduct({...newProduct, BulkSize: e.target.value})} required style={inputStyle}/>
          
          <input type="number" placeholder="Bulk Amount" value={newProduct.BulkAmount} 
            onChange={e => setNewProduct({...newProduct, BulkAmount: e.target.value})} required style={inputStyle}/>
          
          <button type="submit" style={addButtonStyle}>Add to Catalog</button>
        </form>
      )}

      {/* PRODUCT TABLE */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid #3498db", backgroundColor: "#f2f2f2" }}>
            <th style={thStyle}>Product Name</th>
            <th style={thStyle}>Brand</th>
            <th style={thStyle}>Bulk Size</th>
            <th style={thStyle}>Bulk Amount</th>
            {isAdmin && <th style={thStyle}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr key={product.ProductID} style={{ borderBottom: "1px solid #eee", backgroundColor: index % 2 === 0 ? "#fff" : "#fafafa" }}>
              <td style={tdStyle}>{product.ProductName}</td>
              <td style={tdStyle}>{product.Brand}</td>
              <td style={tdStyle}>{product.BulkSize}</td>
              <td style={tdStyle}>{product.BulkAmount}</td>
              {isAdmin && (
                <td style={tdStyle}>
                  <button onClick={() => handleDelete(product.ProductID)} style={deleteButtonStyle}>
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- STYLING ---
const formStyle = { marginBottom: "30px", padding: "20px", background: "#f9f9f9", borderRadius: "8px", border: "1px solid #ddd" };
const inputStyle = { padding: "8px", marginRight: "10px", borderRadius: "4px", border: "1px solid #ddd", width: "150px" };
const addButtonStyle = { backgroundColor: "#27ae60", color: "white", padding: "10px 15px", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" };
const deleteButtonStyle = { backgroundColor: "#e74c3c", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" };
const thStyle = { padding: "12px", color: "#3498db" };
const tdStyle = { padding: "12px" };

export default ProductPage;