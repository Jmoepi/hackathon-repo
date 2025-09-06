export type Product = {
  id: string;
  name: string;
  stock: number;
  price: number;
  lowStockThreshold: number;
};

export type Transaction = {
  id: string;
  amount: number;
  date: string;
  customer: string;
  status: 'Completed' | 'Pending';
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  joined: string;
};

export const initialProducts: Product[] = [
  { id: 'prod-001', name: 'White Bread', stock: 25, price: 18.50, lowStockThreshold: 10 },
  { id: 'prod-002', name: 'Brown Bread', stock: 8, price: 19.00, lowStockThreshold: 10 },
  { id: 'prod-003', name: '2L Milk', stock: 15, price: 32.00, lowStockThreshold: 5 },
  { id: 'prod-004', name: 'Amasi 1L', stock: 4, price: 25.50, lowStockThreshold: 5 },
  { id: 'prod-005', name: 'Eggs (6 pack)', stock: 30, price: 22.00, lowStockThreshold: 12 },
  { id: 'prod-006', name: 'Coca-Cola 2L', stock: 40, price: 28.00, lowStockThreshold: 15 },
  { id: 'prod-007', name: 'Simba Chips (Large)', stock: 12, price: 19.99, lowStockThreshold: 10 },
];

export const initialTransactions: Transaction[] = [
    { id: 'txn-001', amount: 55.50, date: '2023-10-27T10:00:00Z', customer: 'C-001', status: 'Completed' },
    { id: 'txn-002', amount: 32.00, date: '2023-10-27T10:05:00Z', customer: 'C-002', status: 'Completed' },
    { id: 'txn-003', amount: 19.99, date: '2023-10-27T10:12:00Z', customer: 'C-003', status: 'Completed' },
    { id: 'txn-004', amount: 18.50, date: '2023-10-27T10:20:00Z', customer: 'C-001', status: 'Completed' },
];

export const initialCustomers: Customer[] = [
    { id: 'C-001', name: 'Thabo Mbeki', phone: '082 123 4567', joined: '2023-01-15' },
    { id: 'C-002', name: 'Sipho Ndlovu', phone: '073 890 1234', joined: '2023-02-20' },
    { id: 'C-003', name: 'Lerato Zulu', phone: '084 567 8901', joined: '2023-03-05' },
    { id: 'C-004', name: 'Naledi Khumalo', phone: '061 234 5678', joined: '2023-05-10' },
];

export const weeklySalesData = [
  { day: 'Mon', sales: 4000 },
  { day: 'Tue', sales: 3000 },
  { day: 'Wed', sales: 2000 },
  { day: 'Thu', sales: 2780 },
  { day: 'Fri', sales: 1890 },
  { day: 'Sat', sales: 2390 },
  { day: 'Sun', sales: 3490 },
];
