# Startup Incubator AI - CRUD Form Development

## Overview

CRUD (Create, Read, Update, Delete) operations are implemented to manage startup ideas submitted by users.

The CRUD module enables users to:

- Create a new startup idea
- View submitted startup ideas
- Update startup information
- Delete startup records

---

# CRUD Operations

## C - Create

### Purpose

Allows users to submit a new startup idea for AI analysis.

### Input Fields

| Field | Type |
|---------|---------|
| Startup Title | Text |
| Idea Description | Textarea |
| Budget Amount | Number |
| Platform | Dropdown |

### UI Form

```text
+-------------------------------------+
| Submit Startup Idea                 |
+-------------------------------------+

 Startup Title
 [________________________]

 Idea Description
 [________________________]

 Budget Amount
 [________________________]

 Platform
 [ Dropdown ▼ ]

 [ Submit ]
```

### API Endpoint

```http
POST /api/startup
```

### Sample Request

```json
{
  "title": "AI Job Portal",
  "description": "AI-powered recruitment platform",
  "budget": 500000,
  "platform": "SaaS"
}
```

---

## R - Read

### Purpose

Displays all submitted startup ideas.

### API Endpoint

```http
GET /api/startup
```

### Sample Response

```json
[
  {
    "id": 1,
    "title": "AI Job Portal",
    "budget": 500000,
    "platform": "SaaS"
  }
]
```

### UI Table

```text
+--------------------------------------------------+
| Title          | Budget    | Platform | Action   |
+--------------------------------------------------+
| AI Job Portal  | 500000    | SaaS     | View     |
+--------------------------------------------------+
```

---

## U - Update

### Purpose

Allows users to edit startup details.

### API Endpoint

```http
PUT /api/startup/:id
```

### Sample Request

```json
{
  "title": "AI Career Portal",
  "budget": 600000
}
```

### UI Form

```text
+-------------------------------------+
| Update Startup Idea                 |
+-------------------------------------+

 Startup Title
 [AI Career Portal]

 Budget
 [600000]

 [ Update ]
```

---

## D - Delete

### Purpose

Removes startup ideas from the system.

### API Endpoint

```http
DELETE /api/startup/:id
```

### UI Action

```text
[ Delete ]
```

### Confirmation Dialog

```text
Are you sure you want to delete?

[ Yes ] [ No ]
```

---

# CRUD Workflow

```text
User
 │
 ▼
Create Startup Idea
 │
 ▼
Database Storage
 │
 ▼
Read Startup Records
 │
 ▼
Update Startup Details
 │
 ▼
Delete Startup Record
```

---

# React Frontend Example

## Create Startup

```jsx
const submitIdea = async () => {
  await axios.post("/api/startup", {
    title,
    description,
    budget,
    platform
  });
};
```

---

## Read Startups

```jsx
useEffect(() => {
  axios.get("/api/startup")
    .then((res) => setIdeas(res.data));
}, []);
```

---

## Update Startup

```jsx
await axios.put(`/api/startup/${id}`, {
  title,
  budget
});
```

---

## Delete Startup

```jsx
await axios.delete(`/api/startup/${id}`);
```

---

# Node.js Backend Example

## Create

```javascript
router.post("/", async (req, res) => {
  const startup = await Startup.create(req.body);
  res.json(startup);
});
```

---

## Read

```javascript
router.get("/", async (req, res) => {
  const startups = await Startup.find();
  res.json(startups);
});
```

---

## Update

```javascript
router.put("/:id", async (req, res) => {
  const startup = await Startup.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(startup);
});
```

---

## Delete

```javascript
router.delete("/:id", async (req, res) => {
  await Startup.findByIdAndDelete(req.params.id);

  res.json({
    message: "Deleted Successfully"
  });
});
```

---

# Database Operations

| Operation | SQL Query |
|------------|------------|
| Create | INSERT INTO startup_ideas |
| Read | SELECT * FROM startup_ideas |
| Update | UPDATE startup_ideas |
| Delete | DELETE FROM startup_ideas |

---

# Benefits

- Easy Startup Management
- Real-Time Data Updates
- Secure Data Handling
- Scalable Architecture
- User-Friendly Interface

---

# Technology Stack

| Module | Technology |
|----------|-----------|
| Frontend | React.js |
| Forms | React Hook Form |
| Backend | Node.js |
| API | Express.js |
| Database | MySQL |
| Authentication | JWT |
| Styling | Tailwind CSS |

---

# Conclusion

The CRUD Form Development module enables efficient management of startup ideas by providing Create, Read, Update, and Delete operations. It serves as the core data management functionality of the Startup Incubator AI platform.
