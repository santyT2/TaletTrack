# Configurar PyMySQL como reemplazo de mysqlclient
import pymysql

# Parche para que Django 6.0 acepte PyMySQL
pymysql.version_info = (2, 2, 1, "final", 0)
pymysql.install_as_MySQLdb()
