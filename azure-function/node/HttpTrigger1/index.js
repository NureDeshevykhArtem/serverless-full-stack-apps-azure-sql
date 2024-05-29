const sql = require('mssql');

const AZURE_CONN_STRING = process.env["AzureSQLConnectionString"];

module.exports = async function (context, req) {
    context.log('Function execution started.'); // Добавляем сообщение в журнал

    // Проверяем, что получаемые параметры корректны
    const routeId = parseInt(req.query.rid);
    const geofenceId = parseInt(req.query.gid);
    context.log(`Received routeId: ${routeId}, geofenceId: ${geofenceId}`);

    try {
        // Подключаемся к базе данных
        const pool = await sql.connect(AZURE_CONN_STRING);

        // Выполняем запрос к базе данных
        const busData = await pool.request()
            .input("routeId", sql.Int, routeId)
            .input("geofenceId", sql.Int, geofenceId)
            .execute("web.GetMonitoredBusData");

        // Отправляем данные в ответ
        context.res = {
            status: 200,
            body: JSON.parse(busData.recordset[0]["locationData"])
        };
    } catch (error) {
        // Если произошла ошибка, отправляем соответствующий статус и сообщение об ошибке
        context.log.error('An error occurred:', error.message);
        context.res = {
            status: 500,
            body: 'An error occurred. Please try again later.'
        };
    }
};