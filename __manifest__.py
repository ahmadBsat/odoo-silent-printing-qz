{
    'name': 'Your Odoo POS QZ Tray Integration',
    'version': '1.0',
    'category': 'Point of Sale',
    'depends': ['point_of_sale'],
    'data': [
        # Your XML and other data files
    ],
    'assets': {
        'point_of_sale.assets': [
            # Path to the QZ Tray library
            'your_odoo_module/static/src/lib/qz-tray/qz-tray.js',
            # Path to your qz_integration service
            'your_odoo_module/static/src/js/services/qz_integration.js',
            # Any other POS-specific JS files that will use this service
            'your_odoo_module/static/src/js/your_pos_component.js',
        ],
    },
    'installable': True,
    'application': False,
    'license': 'LGPL-3',
}