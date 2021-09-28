let orderDataAll = []; // 所有訂單資料


getOrder(); // 後台初始化

// GET 後台取得訂單
function getOrder() {
  axios.get(api_orders, headers)
    .then(res => {
      console.log('getOrder', res);
      orderDataAll = res.data.orders;
      renderOrder();
      renderC3();
    })
    .then(() => {
      const orderItemStatus = document.querySelectorAll('#order-item-status');
      orderItemStatus.forEach(item => {
        item.addEventListener('click', editOrderStatus);
      })
      const delOrderItemBtns = document.querySelectorAll('#order-del-item');
      delOrderItemBtns.forEach(item => {
        item.addEventListener('click', delOrderItem);
      })
    })
    .catch(err => {
      console.log(err);
      alert('catch 失敗惹 QQ 詳情請見 Console');
    })
}


/* 渲染後台訂單列表 */
const orderItems = document.querySelector('.order-items');

function renderOrder() {
  let str = '';
  orderDataAll.forEach((item) => {
    let itemsTitle = '';
    item.products.forEach(item => {
      itemsTitle += `${item.title} x${item.quantity}<br>`
    })
    console.log(item.paid)
    str +=
      `
      <tr>
          <td>${item.id}</td>
          <td>${item.user.name}</td>
          <td>${item.user.tel}</td>
          <td>${item.user.email}</td>
          <td>${item.user.address}</td>
          <td>${itemsTitle}</td>
          <td>${getLocalTime(item.createdAt)}</td>
          <td>
              <button class="btn" id="order-item-status" data-id="${item.id}" style="color: ${item.paid ? '#28a745' : '#888'}">
                  ${item.paid ? '<i class="fas fa-check-circle"></i> 已處理' : '<i class="fas fa-times-circle"></i> 未處理'}
              </button>
          </td>
          <td>
              <a href="#" id="order-del-item" data-id="${item.id}">刪除</a>
          </td>
      </tr>
      `;
  });
  orderItems.innerHTML = str;
}

// unix 時間戳轉換成本地時間
function getLocalTime(time) {
  const date = new Date(time * 1000);
  return date.toLocaleDateString();
}

// DELETE 刪除單一訂單
function delOrderItem(e) {
  e.preventDefault();
  const id = e.target.dataset.id;
  axios.delete(`${api_orders}/${id}`, headers)
    .then(() => {
      getOrder();
      swal('已刪除此訂單', '', 'success', { timer: '1200' });
    })
    .catch(err => {
      console.log(err);
      alert('catch 失敗惹 QQ 詳情請見 Console');
    })
}

// DELETE 清除全部訂單
const delOrderAllBtn = document.querySelector('#order-del-all');

function delOrderAll() {
  if (orderDataAll.length === 0) {
    return swal('目前沒有訂單', '', 'error');
  }
  swal('確定要刪除全部訂單嗎？', '', 'warning', {
    buttons: {
      cancel: '欸等等',
      danger: '確定'
    }
  }).then((willDelete) => {
    switch (willDelete) {
      case 'danger':
        axios.delete(api_orders, headers)
          .then(res => {
            console.log('delOrderAll', res);
            getOrder();
            swal('已刪除所有訂單', '', 'success', { timer: '1200' });
          })
          .catch(err => {
            console.log(err);
            alert('catch 失敗惹 QQ 詳情請見 Console');
          });
      default:
        break;
    }
  })
}
delOrderAllBtn.addEventListener('click', delOrderAll);

// PUT 修改訂單狀態
function editOrderStatus(e) {
  e.preventDefault();

  let status;
  orderDataAll.forEach(item => {
    if (item.id === e.target.dataset.id) {
      status = !item.paid;
    }
  })
  const data = {
    data: {
      id: e.target.dataset.id,
      paid: status
    },
  };
  axios.put(api_orders, data, headers)
    .then(() => {
      getOrder();
      swal('已變更訂單狀態', `目前狀態：${status ? '已處理' : '未處理'}`, 'success');
    })
    .catch(err => {
      console.log(err);
      alert('catch 失敗惹 QQ 詳情請見 Console');
    })
}



/** 產生 C3 圖表 **/
function renderC3() {
  // 各商品售出總額 {Antony 雙人床架／雙人加大: 13506, ...}
  let obj = {};
  orderDataAll.forEach(itemX => {
    itemX.products.forEach(itemY => {
      if (obj[itemY.title] === undefined) {
        obj[itemY.title] = itemY.quantity * itemY.price;
      } else {
        obj[itemY.title] += itemY.quantity * itemY.price;
      }
    })
  });
  // console.log('obj', obj);

  // 整理成 c3 要求的規格 [[Antony 雙人床架／雙人加大, 13506], ...]
  let arr = [];
  Object.keys(obj).forEach(item => {
    arr.push([item, obj[item]]);
  });
  // console.log('arr', arr);

  // 比大小，降冪排列（目的：取營收前三高的品項當主要色塊，把其餘的品項加總起來當成一個色塊）
  let sortArr = [...arr];

  sortArr.sort((a, b) => {
    return b[1] - a[1];
  })

  if (sortArr.length > 3) {
    let otherTotal = 0;
    for (let i = 3; i < sortArr.length; i++) {
      otherTotal += sortArr[i][1];
    }
    sortArr.splice(3);
    sortArr.push(['其他', otherTotal]);

    // 有可能其他的營業額會多過於前三名品項的營業額，所以要再重排一次
    sortArr.sort((a, b) => {
      return b[1] - a[1];
    })
  }
  // console.log('sortArr', sortArr);

  c3.generate({
    bindto: '#chart',
    data: {
      columns: sortArr,
      type: 'pie',
    },
    color: {
      pattern: ['#444', '#777', '#aaa', '#ccc']
    }
  });
}