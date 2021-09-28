let productList = []; // 所有產品列表
let cartDataAll = []; // 所有購物車資料


// 初始化
function init() {
  getProduct();
  getCart();
}

init();



/** 傢俱列表 product **/

// GET 取得產品列表
function getProduct() {
  axios.get(api_product)
    .then(res => {
      console.log('getProduct', res);
      productList = res.data.products;
      renderProduct(productList);
    })
    .catch(err => {
      console.log(err.response);
      alert('catch 失敗惹 QQ 詳情請見 Console');
    });
}

// 渲染傢俱列表
const productBlock = document.querySelector('.product-block');

function renderProduct(arr) {
  let str = '';
  arr.forEach(item => {
    str +=
      `
      <li class="product-item">
          <div class="product-img bg-cover" style="background-image: url(${item.images}">
            <span class="tag"># ${item.category}</span>
          </div>
          <div class="product-body">
            <h3 class="product-title">${item.title}</h3>
            <p>${item.description}</p>      
          </div>
          <div class="product-footer">
            <del class="origine-price">$${item.origin_price}</del>
            <p class="discount-price">$${item.price}</p> 
            <button type="button" class="btn btn-outline-dark" data-id="${item.id}">
              點此選購
            </button>
          </div>
      </li>
      `
  })
  productBlock.innerHTML = str;

  if (arr.length === 0) {
    productBlock.innerHTML = `<li style="margin: 0 auto 50px">找不到相關的商品... 請輸入其他關鍵字</li>`;
  }
}

// 篩選功能
const searchCategory = document.querySelector('.search-category');
const searchKeyword = document.querySelector('.search-keyword');
const searchBtn = document.querySelector('#search-btn');

function searchProduct() {
  let categoryValue = searchCategory.value;;
  let keywordValue = searchKeyword.value.trim();
  searchCondition(categoryValue, keywordValue);
}
searchBtn.addEventListener('click', searchProduct);

function searchCondition(categoryValue, keywordValue) {
  let filterProductList = [];
  if (categoryValue && keywordValue) {
    filterProductList = productList.filter(item => {
      return categoryValue === item.category && item.title.toUpperCase().indexOf(keywordValue.toUpperCase()) >= 0
    })
  } else if (keywordValue) {
    filterProductList = productList.filter(item => {
      return item.title.toUpperCase().indexOf(keywordValue.toUpperCase()) >= 0
    })
  } else if (categoryValue) {
    filterProductList = productList.filter(item => {
      return categoryValue === item.category
    })
  } else {
    filterProductList = productList;
  }
  renderProduct(filterProductList);
  searchKeyword.value = searchKeyword.value.trim();
}
searchCategory.addEventListener('change', searchProduct);

searchKeyword.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    searchProduct();
  }
});

// 清除 input 關鍵字的值
const delKeyword = document.querySelector('.keyword-del');
delKeyword.addEventListener('click', (e) => {
  e.preventDefault();
  searchKeyword.value = '';
})


/** 購物車 cart **/

// POST 加入購物車（向伺服器發出新增功能的請求，請求成功會將 data 資料寫入資料庫）
productBlock.addEventListener('click', (e) => {
  e.preventDefault();
  if (e.target.nodeName !== 'BUTTON') return;
  let id = e.target.dataset.id;
  addToCart(id);
})

function addToCart(id) {
  let numCheck = 1;
  cartDataAll.carts.forEach(item => { // 若購物車有重複的商品，原本的數量要 +=1
    if (item.product.id === id) {
      numCheck = item.quantity += 1;
    }
  });
  const data = {
    data: {
      productId: id,
      quantity: numCheck
    }
  };
  axios.post(api_carts, data)
    .then(res => {
      console.log('addToCart', res);
      getCart();
      swal('商品已加入購物車', '', 'success', { timer: '1200' });
    })
    .catch(err => {
      console.log(err);
      alert('catch 失敗惹 QQ 詳情請見 Console');
    });
}

// GET 取得購物車列表
function getCart() {
  axios.get(api_carts)
    .then(res => {
      console.log('getCart', res);
      cartDataAll = res.data;
      renderCart();
    })
    .then(() => {
      // 取得每個品項的移除按鈕 DOM
      const delCartItemBtns = document.querySelectorAll('#cart-del-item');
      delCartItemBtns.forEach(item => {
        item.addEventListener('click', delCartItem);
      })

      // 取得每個品項的 +- 按鈕 DOM
      const addNumBtn = document.querySelectorAll('#add-num');
      const reduceNumBtn = document.querySelectorAll('#reduce-num');
      addNumBtn.forEach(item => {
        item.addEventListener('click', addItemNum);
      });
      reduceNumBtn.forEach(item => {
        item.addEventListener('click', reduceItemNum);
      });
    })
    .catch(err => {
      console.log(err);
      alert('catch 失敗惹 QQ 詳情請見 Console');
    })
}

// 渲染購物車列表
const cartTable = document.querySelector('.cart-table');
const cartItems = document.querySelector('.cart-items');
const cartEmpty = document.querySelector('.empty-cart');
const total = document.querySelector('.cart-total');

function renderCart() {
  let str = '';
  cartDataAll.carts.forEach(item => {
    str +=
      `
      <tr>
          <td>
              <img src="${item.product.images}" class="cart-img">
          </td>
          <td>${item.product.title}</td>
          <td>NT$ ${item.product.price}</td>
          <td>
              <button id="reduce-num" data-num="${item.quantity}" data-id="${item.id}"> - </button>
              <label>${item.quantity}</label>
              <button id="add-num" data-num="${item.quantity}" data-id="${item.id}"> + </button>
          </td>
          <td id="cart-item-price">NT$ ${item.product.price * item.quantity}</td>
          <td>
              <a href="#" id="cart-del-item" data-id="${item.id}"></a> 
          </td>
      </tr>
      `; // 要在刪除按鈕埋 id，可以直接刪除 API 中對應的 id 品項
  });
  cartItems.innerHTML = str;
  total.textContent = `總金額 $${cartDataAll.finalTotal}`;

  if (cartDataAll.carts.length === 0) {
    cartTable.style.display = 'none';
    cartEmpty.style.display = 'table';
  } else {
    cartTable.style.display = 'table';
    cartEmpty.style.display = 'none';
  }
}

// PATCH 編輯購物車的產品數量
function addItemNum(e) { // 增加數目
  e.preventDefault();
  let origNum = parseInt(e.target.dataset.num);
  const data = {
    data: {
      id: e.target.dataset.id,
      quantity: origNum += 1
    }
  }
  axios.patch(api_carts, data)
    .then(res => {
      console.log('addItemNum', res);
      getCart();
      swal('已修改商品數量', '', 'success', { timer: '1200' });
    })
    .catch(err => {
      console.log(err);
      alert('catch 失敗惹 QQ 詳情請見 Console');
    });
}

function reduceItemNum(e) { // 減少數目
  e.preventDefault();
  let origNum = parseInt(e.target.dataset.num);
  if (origNum === 1) { // 在點擊 - 按鈕時，若當下的 num 為 1（再 -=1 會是 0），直接刪除該筆項目
    swal('確定要把此商品從購物車移除嗎？', '目前數量小於 1', 'warning', {
      buttons: {
        cancel: '確定刪除',
        danger: '先不要'
      }
    }).then((willDelete) => {
      switch (willDelete) {
        case 'danger':
          break;
        default:
          delCartItem(e);
      }
    })
    return;
  }
  const data = {
    data: {
      id: e.target.dataset.id,
      quantity: origNum -= 1
    }
  }
  axios.patch(api_carts, data)
    .then(res => {
      console.log('reduceItemNum', res);
      getCart();
      swal('已修改商品數量', '', 'success', { timer: '1200' });
    })
    .catch(err => {
      console.log(err);
      alert('catch 失敗惹 QQ 詳情請見 Console');
    });

}

// DELETE 清空購物車所有項目
const delCartBtn = document.querySelector('#del-carts');

function delCartAll() {
  swal('確定要清空購物車嗎？', '', 'warning', {
    buttons: {
      cancel: '讓我想想', // 灰色 default
      danger: '確定', // 紅色
      // 自訂(水藍色): '確定': true
    }
  }).then((willDelete) => {
    switch (willDelete) {
      case 'danger':
        axios.delete(api_carts)
          .then(res => {
            console.log('delCartAll', res);
            swal('已清空購物車', '', 'success', { timer: '1200' });
            getCart();
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
delCartBtn.addEventListener('click', delCartAll);

// DELETE 刪除購物車的單筆項目
function delCartItem(e) {
  e.preventDefault();
  // console.log(e.target.dataset);
  const id = e.target.dataset.id;
  axios.delete(`${api_carts}/${id}`)
    .then(res => {
      console.log('delCartItem', res);
      swal('已刪除此商品', '', 'success', { timer: '1200' });
      getCart();
    })
    .catch(err => {
      console.log(err);
      alert('catch 失敗惹 QQ 詳情請見 Console');
    });
}



/** 表單驗證 validate.js **/
const constraints = {
  姓名: {
    presence: {
      message: '是必填的欄位'
    }
  },
  電話: {
    presence: {
      message: '是必填的欄位'
    },
    length: {
      minimum: 9,
      message: '^ 號碼需超過 8 碼'
    }
  },
  電子郵件: {
    presence: {
      message: '是必填的欄位'
    },
    email: {
      message: '^ 信箱格式不正確'
    }
  },
  寄送地址: {
    presence: {
      message: '是必填的欄位'
    }
  },
  付款方式: {
    presence: {
      message: '是必選的欄位'
    }
  }
};

const reservationForm = document.querySelector('.reservation-form');
const inputs = document.querySelectorAll('.reservation-form input, .reservation-form select');

reservationForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (cartDataAll.carts.length === 0) {
    return swal('目前購物車是空的', '趕快去採購一波吧～', 'error');
  }
  handleFormSubmit();
});

function handleFormSubmit() {
  let errors = validate(reservationForm, constraints);
  if (!errors) return addOrder();
  swal('資料未填寫完妥', '', 'error');

  Object.keys(errors).forEach((item) => {
    document.querySelector(`[data-name="${item}"]`).innerHTML = `<i class="fas fa-exclamation-circle"></i> ${errors[item]}`;
  });

  inputCheck();
};

// 監聽 input 值改變的狀況
function inputCheck() {
  inputs.forEach((item) => {
    item.addEventListener('change', () => {
      let errors = validate(reservationForm, constraints);
      document.querySelector(`[data-name="${item.name}"]`).textContent = '';
      if (errors) {
        Object.keys(errors).forEach((item) => {
          document.querySelector(`[data-name="${item}"]`).innerHTML = `<i class="fas fa-exclamation-circle"></i> ${errors[item]}`;
        })
      }
    });
  })
}



/** 訂單（前台的 reservation / 後台的 order） **/

// POST 送出訂單
// 1. 偵測購物車有無品項（若沒有，會回傳 400 錯誤。有的話會繼續判斷）
// 2. 偵測寄送資訊有無資料（若沒有，會回傳 400 錯誤。有的話就訂單成立，清空購物車，並回傳 200 OK）
function addOrder() {
  const name = document.querySelector('#reservation-name').value;
  const tel = document.querySelector('#reservation-phone').value;
  const email = document.querySelector('#reservation-email').value;
  const address = document.querySelector('#reservation-address').value;
  const payment = document.querySelector('#reservation-pay').value;
  const form = document.querySelector('.reservation-form');

  const data = {
    data: {
      user: {
        name,
        tel,
        email,
        address,
        payment
      }
    }
  };
  axios.post(api_reseveration, data)
    .then(res => {
      console.log('addOrder', res);
      getCart();
      getOrder();
      form.reset();
      swal('訂單已送出', '感謝您的訂購，商品會在幾日後寄出', 'success');
    })
    .catch(err => {
      console.log(err);
      alert('catch 失敗惹 QQ 詳情請見 Console');
    });
}