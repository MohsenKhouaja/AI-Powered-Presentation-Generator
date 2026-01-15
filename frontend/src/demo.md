# Markdown Renderer Demo

> This slide-style markdown is designed to **stress-test** your renderer:  
> typography, tables, alerts, lists, links, images, code blocks, and task lists.

---

## ✨ Features Overview

- Beautiful **headings** and hierarchy  
- Styled **blockquotes** as alerts  
- Rich **tables**  
- Inline and block **code** with syntax highlighting  
- **Images** with captions  
- GFM **task lists**  
- Interactive **links**

---

### 🔧 Task List

- [x] Parse Markdown  
- [x] Render GFM tables  
- [x] Highlight code blocks  
- [ ] Add animations  
- [ ] Export to PDF

---

## 📊 Comparison Table

| Feature        | Supported | Notes                           |
|----------------|-----------|---------------------------------|
| Headings       | ✅        | Responsive typography           |
| Tables         | ✅        | ShadCN table components         |
| Code Blocks    | ✅        | Prism + language header         |
| Blockquotes    | ✅        | Rendered as alert cards         |
| Task Lists     | ✅        | Using custom checkbox component |
| Images         | ✅        | With caption and aspect ratio   |

---

## 💡 Insight

> Great UI is not about *more features*,  
> it’s about making **complex things feel simple**.

---

## 🧠 Inline Code

Use `npm install` to install dependencies.  
Your config file might look like `vite.config.ts`.

---

## 🖥️ Code Block Example

```ts
type User = {
  id: number;
  name: string;
  email: string;
};

function greet(user: User) {
  return `Hello, ${user.name}!`;
}

console.log(greet({ id: 1, name: "Mohsen", email: "m@example.com" }));
