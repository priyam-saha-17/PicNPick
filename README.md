# 📸 PicNPick — AI-Powered Product Deal Finder

**PicNPick** transforms the way users shop: just upload a product image, and our AI assistant identifies the item, crafts a location-aware search query, and returns the best live deals from multiple retailers.

## 🚀 Live Demo

[Live Demo](#) <!-- Replace with actual URL or image screenshot if hosted -->

---

## ✨ Features & Highlights

- **🧠 Image-to-Product AI**: Utilizes **Google Gemini 2.5 Flash** to identify the brand, model, and key product details from an uploaded image.
  
- **🔍 Smart Query Generation**: Automatically generates context-aware search queries like:  
  \`"LG refrigerator deliverable to 700078 India"\` for precise results.

- **🌐 Multi-Retailer Search**: Uses **Google Custom Search API** to gather results globally, with intelligent fallback strategies to enhance retailer relevance.

- **🛍️ Full Deal Cards**: Displays a product card containing:
  - Product image
  - Price
  - Retailer logo
  - Buy link
  - Estimated delivery

- **📍 Location-Aware Results**: Filters deals based on user’s country and pincode.

- **💻 Responsive UI**: Built with **React + TypeScript** and styled using **Tailwind CSS** for a fast, sleek interface.

---

## 🛠 Tech Stack

| Component        | Description                                 |
|------------------|---------------------------------------------|
| **Frontend**     | React, TypeScript, Tailwind CSS             |
| **AI Processing**| Google Gemini 2.5 Flash                     |
| **Search Engine**| Google Custom Search API                    |
| **Parsing**      | Heuristics & structured pagemap parsing     |

---

## ⚙️ Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/priyam-saha-17/PicNPick.git
cd PicNPick
