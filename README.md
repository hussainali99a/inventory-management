# Inventory Management System

A comprehensive Django-based inventory management application for tracking products, categories, suppliers, and stock transactions. Built with Bootstrap 5 for a modern, responsive UI.

## Features

- **Product Management**: Create, update, and delete products with detailed information
- **Category Management**: Organize products into categories
- **Supplier Management**: Track supplier information and relationships
- **Stock Transactions**: Record stock in/out transactions with audit trails
- **Dashboard**: Real-time overview of inventory status, low stock alerts
- **Transaction History**: Detailed history of all stock movements
- **User Authentication**: Secure login and registration system
- **Search & Filter**: Advanced filtering by product name and category
- **Responsive Design**: Mobile-friendly interface built with Bootstrap 5

## Tech Stack

- **Backend**: Django 4.x
- **Database**: SQLite (can be configured for PostgreSQL/MySQL)
- **Frontend**: Bootstrap 5, Font Awesome 6
- **Authentication**: Django built-in authentication system
- **Server**: Django development server (or Gunicorn for production)

## Project Structure

```
inventory-management/
├── inventory_project/          # Django project configuration
│   ├── settings.py            # Project settings
│   ├── urls.py                # URL routing
│   ├── wsgi.py                # WSGI configuration
│   └── asgi.py                # ASGI configuration
├── inventory/                  # Django app
│   ├── models.py              # Database models
│   ├── views.py               # View functions
│   ├── forms.py               # Django forms
│   ├── urls.py                # App URL patterns
│   ├── admin.py               # Django admin configuration
│   └── migrations/            # Database migrations
├── templates/                  # HTML templates
│   ├── base.html              # Base template
│   ├── dashboard.html         # Dashboard page
│   ├── product_list.html      # Products listing
│   ├── product_detail.html    # Product details
│   ├── category_list.html     # Categories listing
│   ├── supplier_list.html     # Suppliers listing
│   ├── transaction_history.html # Transaction history
│   ├── login.html             # Login page
│   └── register.html          # Registration page
├── static/                     # Static files (CSS, JS, images)
├── db.sqlite3                 # SQLite database
├── manage.py                  # Django management tool
├── .gitignore                 # Git ignore file
└── README.md                  # This file
```

## Installation

### Prerequisites

- Python 3.8+
- pip (Python package manager)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd inventory-management
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment**
   
   On Windows:
   ```bash
   venv\Scripts\activate
   ```
   
   On macOS/Linux:
   ```bash
   source venv/bin/activate
   ```

4. **Install dependencies**
   ```bash
   pip install django
   ```

5. **Navigate to project directory**
   ```bash
   cd inventory_project
   ```

6. **Run migrations**
   ```bash
   python manage.py migrate
   ```

7. **Create superuser account**
   ```bash
   python manage.py createsuperuser
   ```
   Follow the prompts to set username, email, and password.

8. **Start the development server**
   ```bash
   python manage.py runserver
   ```

9. **Access the application**
   - Application: http://127.0.0.1:8000/
   - Admin panel: http://127.0.0.1:8000/admin/

## Usage

### Logging In

1. Navigate to the login page
2. Enter your credentials
3. Click "Login" to access the dashboard

### Managing Products

- **View Products**: Click "Products" in the navbar
- **Add Product**: Click "Add Product" button, fill in details
- **Edit Product**: Click on a product from the list
- **Delete Product**: Use the delete option from product details

### Recording Transactions

- **Record Stock**: Click "Stock" in the navbar
- **Select Product**: Choose product from dropdown
- **Enter Quantity**: Input the quantity to add/remove
- **Select Type**: Choose "Stock In" or "Stock Out"
- **Submit**: Save the transaction

### Viewing Dashboard

The dashboard provides:
- Total products, categories, and suppliers count
- Low stock alerts
- Recent transactions
- Quick action buttons

## Models

### Product
- Name, description, price, quantity
- Associated with Category and Supplier
- Tracks creation and modification dates

### Category
- Name and description
- Used to organize products

### Supplier
- Name, contact info, email, phone
- Tracks supplier relationships

### StockTransaction
- Product, quantity, transaction type (IN/OUT)
- Performed by (user), date/time
- Audit trail for inventory movements

## Admin Interface

Access the Django admin panel at `/admin/` to:
- Manage users and permissions
- View and edit all models
- Monitor system activity

## Authentication

- User registration allows new accounts to be created
- Login required for accessing inventory features
- Session-based authentication
- Admin superuser access for advanced features

## Security Features

- CSRF protection on all forms
- Password hashing for user accounts
- Session management
- User authentication required for sensitive operations

## Development

### Running Tests
```bash
python manage.py test
```

### Creating New Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### Shell Access
```bash
python manage.py shell
```

## Production Deployment

For production, consider:
- Use Gunicorn or uWSGI as the application server
- Configure PostgreSQL or MySQL database
- Set `DEBUG = False` in settings.py
- Configure proper `ALLOWED_HOSTS`
- Use environment variables for sensitive data
- Enable HTTPS/SSL
- Set up proper logging
- Use a reverse proxy (Nginx/Apache)

## Troubleshooting

### Database Errors
```bash
python manage.py migrate --run-syncdb
```

### Static Files Not Loading
```bash
python manage.py collectstatic
```

### Permission Denied on Files
Ensure proper file permissions are set on the project directory

## License

This project is provided as-is for educational and business purposes.

## Support

For issues or questions:
1. Check the documentation
2. Review Django official documentation
3. Check error logs in the console

## Changelog

### Version 1.0
- Initial release
- Basic inventory management features
- User authentication
- Dashboard and reporting

## Future Enhancements

- [ ] Excel import/export functionality
- [ ] Barcode scanning
- [ ] Email notifications for low stock
- [ ] Advanced reporting and analytics
- [ ] Multi-warehouse support
- [ ] Mobile app
- [ ] API endpoints
- [ ] Automated backup system