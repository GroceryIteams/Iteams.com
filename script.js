const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
const tbody = document.getElementById('inventoryBody');
const form = document.getElementById('addItemForm');
const totalAmountSpan = document.getElementById('totalAmount');
const totalBagsSpan = document.getElementById('totalBags');
const whatsappLink = document.getElementById('whatsappShare');

function saveInventory() {
  localStorage.setItem('inventory', JSON.stringify(inventory));
}

function calculateBags(quantity, unit) {
  const qtyInKg = unit === 'g' ? quantity / 1000 : quantity;
  return qtyInKg >= 30 ? Math.ceil(qtyInKg / 30) : 0;
}

function updateSummary() {
  const total = inventory.reduce((sum, item) => {
    const qtyInKg = item.unit === 'g' ? item.quantity / 1000 : item.quantity;
    return sum + item.price * qtyInKg;
  }, 0);
  const totalBags = inventory.reduce((sum, item) => {
    return sum + calculateBags(item.quantity, item.unit);
  }, 0);

  totalAmountSpan.textContent = total.toFixed(2);
  totalBagsSpan.textContent = totalBags;

  // Update WhatsApp share link with bags per item
  const message = encodeURIComponent(
    `Ganesh Grains Inventory:\n${inventory
      .map(
        (item, i) =>
          `${i + 1}. ${item.name}: ₹${item.price} x ${item.quantity}${item.unit} = ₹${(
            item.price * (item.unit === 'g' ? item.quantity / 1000 : item.quantity)
          ).toFixed(2)} (${calculateBags(item.quantity, item.unit)} bags)`
      )
      .join('\n')}\n\nTotal Amount: ₹${total.toFixed(2)}\nTotal Bags: ${totalBags}`
  );
  whatsappLink.href = `https://api.whatsapp.com/send?text=${message}`;
}

function renderInventory() {
  tbody.innerHTML = '';
  inventory.forEach((item, index) => {
    const row = document.createElement('tr');
    const qtyInKg = item.unit === 'g' ? item.quantity / 1000 : item.quantity;
    row.innerHTML = `
      <td>${item.name}</td>
      <td>₹${item.price.toFixed(2)}</td>
      <td>${item.quantity}${item.unit}</td>
      <td>${calculateBags(item.quantity, item.unit)}</td>
      <td>₹${(item.price * qtyInKg).toFixed(2)}</td>
      <td class="actions">
        <button onclick="deleteItem(${index})" class="delete">Delete</button>
      </td>
    `;

    // Insert the new row at the top of the table
    tbody.insertBefore(row, tbody.firstChild);
  });
  updateSummary();
}

function deleteItem(index) {
  inventory.splice(index, 1);
  saveInventory();
  renderInventory();
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('itemName').value.trim();
  const price = parseFloat(document.getElementById('itemPrice').value);
  const quantity = parseFloat(document.getElementById('itemQty').value);
  const unit = document.getElementById('qtyUnit').value;

  if (name && price >= 0 && quantity >= 0 && unit) {
    inventory.push({ name, price, quantity, unit });
    saveInventory();
    renderInventory();
    form.reset();
  }
});

// Initial render
renderInventory();