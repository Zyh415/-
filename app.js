// ===== 奖品配置 =====
const PRIZES = {
    medal: {
        name: '起点岛勋章',
        icon: '🏅',
        description: '您获得了一枚荣誉勋章，恭喜您！',
        probability: 1.0  // 100% 概率
    },
    coffee: {
        name: '咖啡券',
        icon: '☕',
        description: '您幸运地获得了一张咖啡券，尽情享受吧！',
        probability: 0.1   // 10% 概率
    }
};

const STORAGE_KEY = 'lottery_records';
const ANIMATION_DURATION = 3000; // 3秒动画时间

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    initializeFilters();
    updateRecordsDisplay();
});

// ===== 表单初始化 =====
function initializeForm() {
    const form = document.getElementById('user-form');
    form.addEventListener('submit', handleLotteryStart);
}

// ===== 处理抽奖开始 =====
function handleLotteryStart(e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();

    // 验证
    if (!validateForm(username, email)) {
        return;
    }

    // 隐藏表单，显示动画
    document.getElementById('form-container').style.display = 'none';
    document.getElementById('lottery-animation').style.display = 'flex';

    // 执行抽奖逻辑
    setTimeout(() => {
        performLottery(username, email);
    }, ANIMATION_DURATION);
}

// ===== 表单验证 =====
function validateForm(username, email) {
    let isValid = true;

    // 清除之前的错误信息
    document.getElementById('username-error').textContent = '';
    document.getElementById('email-error').textContent = '';

    // 验证姓名
    if (!username) {
        document.getElementById('username-error').textContent = '请输入您的姓名';
        isValid = false;
    } else if (username.length > 50) {
        document.getElementById('username-error').textContent = '姓名不能超过50个字符';
        isValid = false;
    }

    // 验证邮箱
    if (!email) {
        document.getElementById('email-error').textContent = '请输入您的邮箱';
        isValid = false;
    } else if (!isValidEmail(email)) {
        document.getElementById('email-error').textContent = '邮箱格式不正确';
        isValid = false;
    }

    return isValid;
}

// ===== 邮箱验证函数 =====
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ===== 执行抽奖 =====
function performLottery(username, email) {
    // 隐藏动画
    document.getElementById('lottery-animation').style.display = 'none';

    // 生成抽奖结果
    const result = generateLotteryResult();

    // 保存记录
    saveRecord({
        username: escapeHtml(username),
        email: escapeHtml(email),
        prize: result.key,
        prizeName: result.name,
        prizeIcon: result.icon,
        prizeDescription: result.description,
        timestamp: new Date().toLocaleString('zh-CN')
    });

    // 显示结果
    displayResult(username, email, result);

    // 更新记录显示
    updateRecordsDisplay();
}

// ===== 生成抽奖结果 =====
function generateLotteryResult() {
    // 所有参与者都会获得起点岛勋章
    let result = PRIZES.medal;
    let resultKey = 'medal';

    // 10% 的概率额外获得咖啡券
    if (Math.random() < PRIZES.coffee.probability) {
        result = PRIZES.coffee;
        resultKey = 'coffee';
    }

    return {
        key: resultKey,
        name: result.name,
        icon: result.icon,
        description: result.description
    };
}

// ===== 显示结果 =====
function displayResult(username, email, result) {
    document.getElementById('result-title').textContent = '🎉 恭喜您！';
    document.getElementById('prize-icon').textContent = result.icon;
    document.getElementById('prize-name').textContent = result.name;
    document.getElementById('prize-description').textContent = result.description;
    document.getElementById('result-username').textContent = username;
    document.getElementById('result-email').textContent = email;
    document.getElementById('result-time').textContent = new Date().toLocaleString('zh-CN');

    document.getElementById('result-container').style.display = 'block';
}

// ===== 重置抽奖 =====
function resetLottery() {
    document.getElementById('user-form').reset();
    document.getElementById('result-container').style.display = 'none';
    document.getElementById('form-container').style.display = 'flex';
    document.getElementById('username-error').textContent = '';
    document.getElementById('email-error').textContent = '';
}

// ===== 保存记录 =====
function saveRecord(record) {
    let records = getRecords();
    records.push(record);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

// ===== 获取记录 =====
function getRecords() {
    const records = localStorage.getItem(STORAGE_KEY);
    return records ? JSON.parse(records) : [];
}

// ===== 清空记录 =====
function clearRecords() {
    if (confirm('确定要清空所有抽奖记录吗？此操作无法撤销！')) {
        localStorage.removeItem(STORAGE_KEY);
        updateRecordsDisplay();
        alert('所有记录已清空');
    }
}

// ===== 初始化筛选器 =====
function initializeFilters() {
    const searchInput = document.getElementById('search-input');
    const filterSelect = document.getElementById('filter-prize');

    searchInput.addEventListener('input', updateRecordsDisplay);
    filterSelect.addEventListener('change', updateRecordsDisplay);
}

// ===== 更新记录显示 =====
function updateRecordsDisplay() {
    const records = getRecords();
    const searchQuery = document.getElementById('search-input').value.toLowerCase();
    const prizeFilter = document.getElementById('filter-prize').value;

    // 过滤记录
    let filteredRecords = records.filter(record => {
        const matchesSearch = record.username.toLowerCase().includes(searchQuery) ||
                             record.email.toLowerCase().includes(searchQuery);
        const matchesPrize = !prizeFilter || record.prizeName === prizeFilter;
        return matchesSearch && matchesPrize;
    });

    // 更新统计数据
    updateStats(records);

    // 显示表格
    displayRecordsTable(filteredRecords);
}

// ===== 更新统计数据 =====
function updateStats(records) {
    const totalCount = records.length;
    const medalCount = records.filter(r => r.prize === 'medal').length;
    const coffeeCount = records.filter(r => r.prize === 'coffee').length;

    document.getElementById('total-count').textContent = totalCount;
    document.getElementById('medal-count').textContent = medalCount;
    document.getElementById('coffee-count').textContent = coffeeCount;
}

// ===== 显示记录表格 =====
function displayRecordsTable(records) {
    const tbody = document.getElementById('records-tbody');

    if (records.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="5">暂无抽奖记录</td></tr>';
        return;
    }

    tbody.innerHTML = records.map((record, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${record.username}</td>
            <td>${record.email}</td>
            <td><span title="${record.prizeName}">${record.prizeIcon} ${record.prizeName}</span></td>
            <td>${record.timestamp}</td>
        </tr>
    `).join('');
}

// ===== 导出为 CSV =====
function exportRecords() {
    const records = getRecords();

    if (records.length === 0) {
        alert('没有可导出的记录');
        return;
    }

    // 准备CSV内容
    const headers = ['序号', '姓名', '邮箱', '获奖项目', '抽奖时间'];
    const rows = records.map((record, index) => [
        index + 1,
        record.username,
        record.email,
        record.prizeName,
        record.timestamp
    ]);

    // 创建CSV字符串
    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
        csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    // 创建下载链接
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `lottery_records_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert('记录已导出');
}

// ===== 页面切换 =====
function switchPage(pageName) {
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // 取消所有导航按钮的active状态
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // 显示选中的页面
    document.getElementById(`${pageName}-page`).classList.add('active');

    // 设置对应按钮为active
    event.target.classList.add('active');

    // 如果是记录页面，更新显示
    if (pageName === 'records') {
        updateRecordsDisplay();
    }
}

// ===== HTML转义函数（防止XSS） =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
