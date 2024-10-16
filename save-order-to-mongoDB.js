const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Подключение к MongoDB
mongoose.connect('mongodb+srv://wixi4598:gj2TIqB9qCzKUeeR@cluster0.zoliw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Определение схемы для заказа
const orderSchema = new mongoose.Schema({
  orderNumber: String,
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  shippingAddress: String,
  shippingCity: String,
  shippingPostalCode: String,
  shippingCountry: String,
  items: Array,
  totalPrice: Number,
  currency: String,
});

const Order = mongoose.model('Order', orderSchema);

app.post('/api/mongo-orders', async (req, res) => {
  try {
    console.log('Полученные заказы:', req.body.data);

    // Извлечение нужных данных из запроса
    const { orderNumber, buyerEmail, billingInfo, lineItems, priceSummary } = req.body.data;

    // Проверки на существование данных
    const customerName = billingInfo?.contactDetails?.firstName && billingInfo?.contactDetails?.lastName
      ? ${billingInfo.contactDetails.firstName} ${billingInfo.contactDetails.lastName}
      : 'Не указано';
    const customerEmail = buyerEmail || 'Не указано';
    const customerPhone = billingInfo?.contactDetails?.phone || 'Телефон не указан';

    // Данные доставки
    const shippingCity = billingInfo?.address?.city || 'Город не указан';
    const shippingAddress = billingInfo?.address?.addressLine || 'Адрес не указан';
    const shippingPostalCode = billingInfo?.address?.postalCode || 'Почтовый индекс не указан';
    const shippingCountry = billingInfo?.address?.countryFullname || 'Страна не указана';

    // Извлечение товаров
    const items = Array.isArray(lineItems)
      ? lineItems.map(item => ({
          itemName: item.itemName || 'Не указано',
          quantity: item.quantity || 1,
          price: item.totalPrice?.value || 0,
        }))
      : [];

    const totalPrice = priceSummary?.total?.value || 0;
    const currency = priceSummary?.total?.currency || 'UAH';

    // Сохранение данных в MongoDB
    const newOrder = new Order({
      orderNumber,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      shippingCity,
      shippingPostalCode,
      shippingCountry,
      items,
      totalPrice,
      currency,
    });

    await newOrder.save();

    res.status(200).json({ message: "Данные успешно сохранены в MongoDB" });
  } catch (error) {
    console.error("Ошибка при сохранении данных в MongoDB:", error);
    res.status(500).json({ message: "Ошибка при сохранении данных" });
  }
});

app.listen(5000, () => {
  console.log('Сервер запущен на http://localhost:5000');
});
