mysql:
	docker-compose exec db bash -c "mysql -u \"\$$MYSQL_USER\" -p\"\$$MYSQL_PASSWORD\" \"\$$MYSQL_DATABASE\""
