# Estatemar Admin Panel Requirements Document

**Version**: 1.0  
**Date**: June 21, 2025  
**Prepared for**: Estatemar Internal Development Team  
**Scope**: Admin interface for managing properties, developers, and ROI data  
**Stage**: Pre-launch, internal use only

---

## Navigation Structure

### Sidebar / Top Navigation:
1. Dashboard  
2. Properties  
3. Developers  
4. ROI Estimator  
5. Settings  
6. My Account

---

## 1. Dashboard

**Purpose**: Provide a high-level overview of the platform's internal data and activity.

### Components:
- Total number of properties
- Properties by type (Apartment, Villa, etc.)
- Total number of developers
- Recently added or updated properties (last 7 days)
- Quick Action Buttons:
  - Add New Property
  - Add Developer

---

## 2. Properties Management

**Purpose**: View, add, edit, and delete properties listed on the platform.

### Features:
- Table listing all properties with columns:
  - Name
  - Developer
  - Type
  - Location
  - Price
  - Status (Draft/Published)
  - Actions (Edit/Delete)

### Actions:
- **Add/Edit Property Form Fields:**

| Field | Type | Notes |
|---|---|---|
| Title | String | |
| Description | Text | |
| Price | Decimal | |
| Developer | Relation | Links to Developer table |
| Property Type | Enum | 'Apartment', 'Villa', 'Townhouse', etc. |
| Listing Type | Enum | 'For Sale', 'For Rent' |
| Location | String | e.g., 'Downtown Dubai' |
| Address | String | Full address |
| Latitude | Float | |
| Longitude | Float | |
| Area | Decimal | In sqm or sqft |
| Bedrooms | Integer | |
| Bathrooms | Integer | |
| Parking Spaces | Integer | |
| Year Built | Integer | |
| Amenities | Array/Tags | e.g., ['Pool', 'Gym'] |
| Image URLs | Array/JSON | List of URLs for the gallery |
| Virtual Tour URL | String | Optional |
| Status | Enum | 'Available', 'Sold', 'Rented' |
| Is Featured | Boolean | For highlighting properties |
| Agent Name | String | |
| Agent Phone | String | |
| Agent Email | String | |

- **Delete Property** (with confirmation dialog)

---

## 3. Developer Management

**Purpose**: Manage property developers listed in the system.

### Features:
- Table of developers:
  - Name
  - Email
  - Total Properties
  - Actions (Edit/Delete)

### Actions:
- Add Developer:
  - Name
  - Email
  - Phone (optional)
  - Company Info
- Edit Developer
- Delete Developer:
  - Only if no properties linked (or with warning)

---

## 4. ROI Estimator

**Purpose**: Estimate and manage ROI and rental yield values for each property.

### Features:
- Table of properties with columns:
  - Property Name
  - Address
  - Type
  - ROI (%)
  - Rental Yield (%)
  - Actions (Edit ROI)

### ROI Estimation Form:
- Auto-filled Fields:
  - Property Name
  - Location
  - Base Property Price
- Input Fields:
  - Estimated Monthly Rent
  - Annual Maintenance Cost
  - Other Annual Costs
  - Expected Occupancy Rate (%)
  - Market Appreciation Rate (%)
- Auto-calculated Fields:
  - Annual Rental Income
  - ROI (%)
  - Rental Yield (%)
- Manual Override Option:
  - Manually enter ROI or Rental Yield if needed
- Actions:
  - Save
  - Recalculate
  - Reset
  - Cancel

### Calculation Reference:
ROI (%) = ((Annual Rent - Annual Costs) / Property Price) * 100  
Rental Yield (%) = (Annual Rent / Property Price) * 100

---

## 5. Settings

**Purpose**: Configure basic platform-wide preferences.

### Features:
- Default currency (e.g., USD, AED)
- Unit system (m² or ft²)
- Toggle maintenance mode (on/off)
- Admin password change (optional)

---

## 6. My Account

**Purpose**: Manage admin profile details.

### Features:
- View/edit profile
- Change password
- Logout button

---

## Admin Roles (Optional, Phase 2)

If needed, restrict access by role:

| Role         | Permissions                                      |
|--------------|--------------------------------------------------|
| Super Admin  | Full access                                      |
| Manager      | Add/edit properties and developers               |
| Analyst      | View & manage ROI data only                      |

---

## Database Requirements (Summary Only)

**Entities:**
- Property (linked to Developer)
- Developer
- ROI Data (linked to Property)
- Admin User 

---

## UI & Theme Guidelines

### Color Palette

| Name       | Hex         | Usage                               |
|------------|-------------|-------------------------------------|
| Primary    | `#027BFF`   | Main brand color, links, buttons    |
| Grey       | `#363636`   | Main text, headlines, icons         |
| Soft Blue  | `#E1F0FF`   | Secondary actions, backgrounds      |
| White      | `#FFFFFF`   | Main background, text on dark bg    |
| Success    | `#4CAF50`   | Success messages, confirmation      |
| Warning    | `#FF9800`   | Warnings, alerts                    |
| Error      | `#E53E3E`   | Error messages, destructive actions |

### Typography

- **Font Family**: Montserrat

| Style          | Size  | Weight      |
|----------------|-------|-------------|
| Headline 1     | 32px  | Bold (700)  |
| Headline 2     | 28px  | Bold (700)  |
| Headline 3     | 24px  | Semi-Bold (600) |
| Headline 4-6   | 20-16px | Semi-Bold (600) |
| Body Text 1    | 16px  | Normal (400)|
| Body Text 2    | 14px  | Normal (400)|
| Button         | 14px  | Semi-Bold (600) |
| Caption        | 12px  | Normal (400)| 