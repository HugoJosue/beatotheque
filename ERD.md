# ERD — Beatothèque (Entité-Association)

## Entités et attributs

### User
- **id** (uuid, PK)
- email (string, UNIQUE)
- passwordHash (string)
- createdAt (datetime)

### Beat
- **id** (uuid, PK)
- title (string)
- bpm (int)
- style (string)
- key (string)
- price (decimal 10,2)
- previewUrl (string)
- createdAt (datetime)
- **userId** (uuid, FK → User.id)

### License
- **id** (uuid, PK)
- name (string)
- price (decimal 10,2)
- rightsText (text)
- createdAt (datetime)
- **beatId** (uuid, FK → Beat.id)

## Cardinalités

- User **1** ──< **N** Beat  (un utilisateur possède plusieurs beats)
- Beat **1** ──< **N** License  (un beat a plusieurs licences)

## Représentation ASCII

```
┌──────────────┐          ┌──────────────┐          ┌──────────────┐
│    USER      │  1    N  │    BEAT      │  1    N  │   LICENSE    │
│──────────────│──────────│──────────────│──────────│──────────────│
│ id (PK)      │          │ id (PK)      │          │ id (PK)      │
│ email        │          │ title        │          │ name         │
│ passwordHash │          │ bpm          │          │ price        │
│ createdAt    │          │ style        │          │ rightsText   │
│              │          │ key          │          │ createdAt    │
│              │          │ price        │          │ beatId (FK)  │
│              │          │ previewUrl   │          │              │
│              │          │ createdAt    │          │              │
│              │          │ userId (FK)  │          │              │
└──────────────┘          └──────────────┘          └──────────────┘
```

> Note : Générez le diagramme visuel avec dbdiagram.io (importer le SQL ci-dessous)
> et exportez en PNG/PDF sous le nom `ERD.png` à la racine du dépôt.

## SQL pour dbdiagram.io

```sql
Table users {
  id uuid [pk]
  email varchar [unique, not null]
  passwordHash varchar [not null]
  createdAt timestamp
}

Table beats {
  id uuid [pk]
  title varchar [not null]
  bpm int [not null]
  style varchar [not null]
  key varchar [not null]
  price decimal(10,2) [not null]
  previewUrl varchar [not null]
  createdAt timestamp
  userId uuid [ref: > users.id]
}

Table licenses {
  id uuid [pk]
  name varchar [not null]
  price decimal(10,2) [not null]
  rightsText text [not null]
  createdAt timestamp
  beatId uuid [ref: > beats.id]
}
```
