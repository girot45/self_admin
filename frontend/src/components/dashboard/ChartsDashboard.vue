<template>
  <div class="csv-analyzer">
    <!-- Индикатор загрузки -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <p>Обработка данных...</p>
    </div>
    
    <!-- Сообщения об ошибках -->
    <div v-if="errors.length" class="error-messages">
      <div v-for="error in errors" :key="error" class="error">
        {{ error }}
      </div>
    </div>
    
    <!-- Загрузка файла -->
    <div class="upload-section">
      <h3>Загрузка CSV файла</h3>
      <div class="file-input-container">
        <label class="file-input-label">
          <input 
            type="file" 
            accept=".csv, .txt, .tsv" 
            @change="handleFileUpload"
            ref="fileInput"
            class="file-input"
          >
          <span class="file-input-button">Выберите файл</span>
          <span class="file-input-name">{{ selectedFileName || 'Файл не выбран' }}</span>
        </label>
        
        <button 
          v-if="data.length > 0"
          @click="clearData"
          class="clear-button"
        >
          Очистить данные
        </button>
      </div>
      
      <!-- Настройки парсинга -->
      <div v-if="data.length === 0" class="parse-settings">
        <div class="setting-item">
          <label>Разделитель:</label>
          <select v-model="delimiter" class="setting-select">
            <option value=",">Запятая (,)</option>
            <option value=";">Точка с запятой (;)</option>
            <option value="\t">Табуляция (Tab)</option>
            <option value="|">Вертикальная черта (|)</option>
            <option value="auto">Автоопределение</option>
          </select>
        </div>
        
        <div class="setting-item">
          <label>
            <input type="checkbox" v-model="hasHeaders">
            Первая строка содержит заголовки
          </label>
        </div>
      </div>
    </div>
    
    <!-- Предпросмотр данных -->
    <div v-if="data.length > 0" class="data-preview">
      <h3>Загруженные данные</h3>
      <div class="preview-info">
        <span>Строк: {{ data.length }}</span>
        <span>Колонок: {{ headers.length }}</span>
        <button @click="togglePreview" class="preview-toggle">
          {{ showFullPreview ? 'Свернуть' : 'Развернуть' }}
        </button>
        <button @click="exportData('csv')" class="export-button">Экспорт CSV</button>
        <button @click="exportData('json')" class="export-button">Экспорт JSON</button>
      </div>
      
      <div class="table-container" v-if="showFullPreview">
        <table>
          <thead>
            <tr>
              <th v-for="header in headers" :key="header">
                {{ header }}
                <div class="header-type">{{ detectColumnType(header) }}</div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in previewRows" :key="index">
              <td v-for="header in headers" :key="header">
                {{ row[header] }}
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="data.length > 50" class="preview-note">
          Показано 50 из {{ data.length }} строк
        </div>
      </div>
      
      <!-- Анализ данных -->
      <div class="data-analysis">
        <h4>Статистика по колонкам:</h4>
        <div class="stats-grid">
          <div v-for="stat in columnStats" :key="stat.header" class="stat-card">
            <div class="stat-header">{{ stat.header }}</div>
            <div class="stat-type">{{ stat.type }}</div>
            <div v-if="stat.type === 'number'" class="stat-numbers">
              <div>Ср: {{ stat.mean.toFixed(2) }}</div>
              <div>Мин: {{ stat.min }}</div>
              <div>Макс: {{ stat.max }}</div>
            </div>
            <div v-if="stat.type === 'string'" class="stat-strings">
              <div>Уникальных: {{ stat.unique }}</div>
              <div>Частота: {{ stat.topValue }} ({{ stat.topCount }})</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Настройки графиков -->
    <div v-if="data.length > 0" class="chart-controls">
      <h3>Настройки графиков</h3>
      
      <div class="field-selectors">
        <div class="field-selector">
          <label>Ось X (категории):</label>
          <select v-model="selectedXField" class="field-select">
            <option value="">-- Выберите поле --</option>
            <option 
              v-for="header in categoricalHeaders" 
              :value="header" 
              :key="header"
            >
              {{ header }}
            </option>
          </select>
        </div>
        
        <div class="field-selector">
          <label>Ось Y (значения):</label>
          <select v-model="selectedYField" class="field-select">
            <option value="">-- Выберите поле --</option>
            <option 
              v-for="header in numericHeaders" 
              :value="header" 
              :key="header"
            >
              {{ header }}
            </option>
          </select>
        </div>
        
        <div class="field-selector" v-if="hasCategoricalData">
          <label>Группировка:</label>
          <select v-model="selectedGroupField" class="field-select">
            <option value="">Без группировки</option>
            <option 
              v-for="header in categoricalHeaders.filter(h => h !== selectedXField)" 
              :value="header" 
              :key="header"
            >
              {{ header }}
            </option>
          </select>
        </div>
      </div>
      
      <!-- Типы графиков -->
      <div class="chart-types">
        <button 
          v-for="chart in availableCharts" 
          :key="chart.type"
          @click="activeChart = chart.type"
          :class="['chart-type-button', { active: activeChart === chart.type }]"
        >
          {{ chart.label }}
        </button>
      </div>
    </div>
    
    <!-- Графики -->
    <div v-if="showChart && chartData.labels" class="charts-section">
      <div class="chart-header">
        <h4>{{ chartTitle }}</h4>
        <div class="chart-actions">
          <button @click="exportChart" class="chart-action-button">
            Экспорт PNG
          </button>
          <button @click="toggleFullscreen" class="chart-action-button">
            {{ isFullscreen ? 'Выйти' : 'На весь экран' }}
          </button>
        </div>
      </div>
      
      <div 
        ref="chartContainer" 
        :class="['chart-container', { 'fullscreen': isFullscreen }]"
      >
        <canvas ref="chartCanvas"></canvas>
      </div>
      
      <div class="chart-summary">
        <div v-if="chartSummary" class="summary-content">
          <strong>Сводка:</strong> {{ chartSummary }}
        </div>
      </div>
    </div>
    
    <!-- Управление графиками -->
    <div v-if="chartInstances.length > 0" class="chart-management">
      <h4>История графиков</h4>
      <div class="chart-history">
        <div 
          v-for="instance in chartInstances" 
          :key="instance.id"
          class="chart-history-item"
          @click="restoreChart(instance)"
        >
          <div class="history-title">{{ instance.title }}</div>
          <div class="history-info">
            <span>{{ instance.type }}</span>
            <span>{{ instance.date }}</span>
          </div>
          <button @click.stop="removeChart(instance.id)" class="remove-chart">
            ×
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default {
  name: 'CSVAnalyzer',
  data() {
    return {
      // Данные
      data: [],
      headers: [],
      previewRows: [],
      
      // Настройки
      delimiter: 'auto',
      hasHeaders: true,
      loading: false,
      errors: [],
      selectedFileName: '',
      
      // Предпросмотр
      showFullPreview: false,
      
      // Анализ
      columnStats: [],
      
      // Графики
      selectedXField: '',
      selectedYField: '',
      selectedGroupField: '',
      activeChart: 'bar',
      chartData: {},
      chartOptions: {},
      chartInstance: null,
      chartInstances: [],
      isFullscreen: false,
      
      // Доступные типы графиков
      availableCharts: [
        { type: 'bar', label: 'Столбчатая' },
        { type: 'line', label: 'Линейная' },
        { type: 'pie', label: 'Круговая' },
        { type: 'doughnut', label: 'Кольцевая' },
        { type: 'radar', label: 'Радарная' },
        { type: 'scatter', label: 'Точечная' }
      ],
      
      // Кэш
      cacheKey: 'csvAnalyzerData'
    };
  },
  computed: {
    showChart() {
      return this.data.length > 0 && 
             this.selectedXField && 
             this.selectedYField &&
             this.chartData.labels &&
             this.chartData.labels.length > 0;
    },
    
    categoricalHeaders() {
      return this.headers.filter(header => 
        this.columnStats.find(s => s.header === header)?.type === 'string'
      );
    },
    
    numericHeaders() {
      return this.headers.filter(header => 
        this.columnStats.find(s => s.header === header)?.type === 'number'
      );
    },
    
    hasCategoricalData() {
      return this.categoricalHeaders.length > 1;
    },
    
    chartTitle() {
      if (!this.selectedXField || !this.selectedYField) return '';
      
      let title = `${this.selectedYField} по ${this.selectedXField}`;
      if (this.selectedGroupField) {
        title += ` (группировка: ${this.selectedGroupField})`;
      }
      return title;
    },
    
    chartSummary() {
      if (!this.chartData.datasets || this.chartData.datasets.length === 0) return '';
      
      const dataset = this.chartData.datasets[0];
      const values = dataset.data;
      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;
      const max = Math.max(...values);
      const min = Math.min(...values);
      
      return `Всего: ${sum.toLocaleString()}, Среднее: ${avg.toFixed(2)}, Диапазон: ${min} - ${max}`;
    }
  },
  methods: {
    // === Загрузка и парсинг файла ===
    async handleFileUpload(event) {
      const file = event.target.files[0];
      
      if (!file) {
        return;
      }
      
      this.loading = true;
      this.errors = [];
      this.selectedFileName = file.name;
      
      try {
        // Чтение файла
        const text = await this.readFileAsText(file);
        
        // Определение разделителя
        const detectedDelimiter = this.delimiter === 'auto' 
          ? this.detectDelimiter(text) 
          : this.delimiter;
        
        // Парсинг CSV
        this.parseCSV(text, ',');
        
        // Анализ данных
        this.analyzeData();
        
        // Сохранение в кэш
        this.saveToCache();
        
        // Автоматический выбор полей для графиков
        this.autoSelectFields();
        
      } catch (error) {
        console.error('Ошибка при обработке файла:', error);
        this.errors.push(`Ошибка: ${error.message}`);
      } finally {
        this.loading = false;
      }
    },
    
    readFileAsText(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsText(file, 'UTF-8');
      });
    },
    
    detectDelimiter(text) {
      const firstLine = text.split('\n')[0];
      const delimiters = [',', ';', '\t', '|'];
      const counts = delimiters.map(d => (firstLine.match(new RegExp(`[^${d}\\\\${d}]${d}[^${d}]`, 'g')) || []).length);
      const maxIndex = counts.indexOf(Math.max(...counts));
      return delimiters[maxIndex];
    },
    
    parseCSV(text, delimiter) {
      const lines = text.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      if (lines.length === 0) {
        throw new Error('Файл пустой');
      }
      
      // Определяем заголовки
      const firstLine = lines[0];
      const parsedHeaders = this.parseCSVLine(firstLine, delimiter);
      
      if (this.hasHeaders) {
        this.headers = parsedHeaders.map(header => 
          header.trim().toLowerCase().replace(/[^a-z0-9а-яё]/gi, '_')
        );
        lines.shift(); // Удаляем строку заголовков
      } else {
        this.headers = parsedHeaders.map((_, i) => `column_${i + 1}`);
      }
      
      // Парсим данные
      this.data = [];
      for (let i = 0; i < lines.length; i++) {
        try {
          const values = this.parseCSVLine(lines[i], delimiter);
          
          if (values.length === this.headers.length) {
            const row = {};
            this.headers.forEach((header, index) => {
              let value = values[index] ? values[index].trim() : '';
              // Попытка преобразовать в число
              const numValue = parseFloat(value.replace(',', '.'));
              row[header] = isNaN(numValue) ? value : numValue;
            });
            this.data.push(row);
          }
        } catch (error) {
          console.warn(`Ошибка в строке ${i + 1}:`, error);
        }
      }
      
      // Подготавливаем строки для предпросмотра
      this.previewRows = this.data.slice(0, 50);
      
      if (this.data.length === 0) {
        throw new Error('Не удалось распарсить данные');
      }
    },
    
    parseCSVLine(line, delimiter) {
      const result = [];
      let current = '';
      let inQuotes = false;
      let quoteChar = '"';
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];
        
        // Определяем символ кавычек
        if ((char === '"' || char === "'") && !inQuotes) {
          inQuotes = true;
          quoteChar = char;
          continue;
        }
        
        if (char === quoteChar && inQuotes) {
          if (nextChar === quoteChar) {
            current += char;
            i++; // Пропускаем следующую кавычку
          } else {
            inQuotes = false;
          }
          continue;
        }
        
        if (char === delimiter && !inQuotes) {
          result.push(current);
          current = '';
          continue;
        }
        
        current += char;
      }
      
      result.push(current);
      return result;
    },
    
    // === Анализ данных ===
    analyzeData() {
      this.columnStats = this.headers.map(header => {
        const values = this.data.map(row => row[header]);
        const numericValues = values.filter(v => typeof v === 'number');
        
        if (numericValues.length > values.length * 0.7) {
          // Числовая колонка
          const sorted = numericValues.sort((a, b) => a - b);
          return {
            header,
            type: 'number',
            mean: sorted.reduce((a, b) => a + b, 0) / sorted.length,
            median: sorted[Math.floor(sorted.length / 2)],
            min: sorted[0],
            max: sorted[sorted.length - 1],
            sum: sorted.reduce((a, b) => a + b, 0),
            count: sorted.length,
            missing: values.length - numericValues.length
          };
        } else {
          // Строковая колонка
          const frequency = {};
          values.forEach(v => {
            const key = String(v);
            frequency[key] = (frequency[key] || 0) + 1;
          });
          
          const sortedFreq = Object.entries(frequency)
            .sort((a, b) => b[1] - a[1]);
          
          return {
            header,
            type: 'string',
            unique: sortedFreq.length,
            topValue: sortedFreq[0]?.[0] || '',
            topCount: sortedFreq[0]?.[1] || 0,
            frequency,
            missing: values.filter(v => v === '' || v === null || v === undefined).length
          };
        }
      });
    },
    
    detectColumnType(header) {
      const stat = this.columnStats.find(s => s.header === header);
      return stat?.type === 'number' ? 'число' : 'текст';
    },
    
    autoSelectFields() {
      if (this.categoricalHeaders.length > 0) {
        this.selectedXField = this.categoricalHeaders[0];
      }
      
      if (this.numericHeaders.length > 0) {
        this.selectedYField = this.numericHeaders[0];
      }
      
      // Если есть еще одна категориальная колонка, предлагаем ее для группировки
      if (this.categoricalHeaders.length > 1) {
        this.selectedGroupField = this.categoricalHeaders[1];
      }
    },
    
    // === Графики ===
    prepareChartData() {
      if (!this.selectedXField || !this.selectedYField) {
        return;
      }
      
      const xValues = [...new Set(this.data.map(row => row[this.selectedXField]))];
      
      let datasets = [];
      
      if (this.selectedGroupField) {
        // С группировкой
        const groups = [...new Set(this.data.map(row => row[this.selectedGroupField]))];
        
        datasets = groups.map((group, groupIndex) => {
          const groupData = this.data.filter(row => row[this.selectedGroupField] === group);
          const data = xValues.map(xValue => {
            const rows = groupData.filter(row => row[this.selectedXField] === xValue);
            return rows.reduce((sum, row) => sum + (Number(row[this.selectedYField]) || 0), 0);
          });
          
          return {
            label: String(group),
            data,
            backgroundColor: this.getColor(groupIndex, 0.6),
            borderColor: this.getColor(groupIndex, 1),
            borderWidth: 2,
            fill: this.activeChart === 'line' ? false : true
          };
        });
      } else {
        // Без группировки
        const data = xValues.map(xValue => {
          const rows = this.data.filter(row => row[this.selectedXField] === xValue);
          return rows.reduce((sum, row) => sum + (Number(row[this.selectedYField]) || 0), 0);
        });
        
        datasets = [{
          label: this.selectedYField,
          data,
          backgroundColor: xValues.map((_, i) => this.getColor(i, 0.6)),
          borderColor: xValues.map((_, i) => this.getColor(i, 1)),
          borderWidth: 2
        }];
      }
      
      this.chartData = {
        labels: xValues.map(String),
        datasets
      };
      
      this.chartOptions = this.getChartOptions();
      
      this.$nextTick(() => {
        this.renderChart();
      });
    },
    
    getChartOptions() {
      const isCircular = ['pie', 'doughnut'].includes(this.activeChart);
      
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: isCircular ? 'right' : 'top',
            labels: {
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const value = context.parsed.y || context.parsed;
                return `${label}: ${value.toLocaleString()}`;
              }
            }
          }
        },
        scales: isCircular ? {} : {
          x: {
            title: {
              display: true,
              text: this.selectedXField,
              font: {
                size: 14,
                weight: 'bold'
              }
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: this.selectedYField,
              font: {
                size: 14,
                weight: 'bold'
              }
            },
            ticks: {
              callback: (value) => {
                if (value >= 1000) {
                  return (value / 1000).toFixed(1) + 'k';
                }
                return value;
              }
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        },
        animation: {
          duration: this.data.length > 1000 ? 0 : 1000
        }
      };
    },
    
    renderChart() {
      // Уничтожаем старый график
      if (this.chartInstance) {
        this.chartInstance.destroy();
      }
      
      const canvas = this.$refs.chartCanvas;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      this.chartInstance = new Chart(ctx, {
        type: this.activeChart,
        data: this.chartData,
        options: this.chartOptions
      });
      
      // Сохраняем в историю
      this.saveToHistory();
    },
    
    getColor(index, opacity = 1) {
      const colors = [
        `rgba(54, 162, 235, ${opacity})`,   // Синий
        `rgba(255, 99, 132, ${opacity})`,   // Красный
        `rgba(75, 192, 192, ${opacity})`,   // Зеленый
        `rgba(255, 206, 86, ${opacity})`,   // Желтый
        `rgba(153, 102, 255, ${opacity})`,  // Фиолетовый
        `rgba(255, 159, 64, ${opacity})`,   // Оранжевый
        `rgba(201, 203, 207, ${opacity})`,  // Серый
        `rgba(255, 99, 255, ${opacity})`,   // Розовый
        `rgba(99, 255, 132, ${opacity})`,   // Светло-зеленый
        `rgba(99, 132, 255, ${opacity})`    // Голубой
      ];
      return colors[index % colors.length];
    },
    
    // === Управление графиками ===
    saveToHistory() {
      const chartData = {
        id: Date.now(),
        title: this.chartTitle,
        type: this.activeChart,
        date: new Date().toLocaleTimeString(),
        data: JSON.parse(JSON.stringify(this.chartData)),
        config: {
          xField: this.selectedXField,
          yField: this.selectedYField,
          groupField: this.selectedGroupField
        }
      };
      
      this.chartInstances.unshift(chartData);
      
      // Ограничиваем историю 10 графиками
      if (this.chartInstances.length > 10) {
        this.chartInstances.pop();
      }
      
      // Сохраняем историю в localStorage
      localStorage.setItem('chartHistory', JSON.stringify(this.chartInstances));
    },
    
    restoreChart(instance) {
      this.selectedXField = instance.config.xField;
      this.selectedYField = instance.config.yField;
      this.selectedGroupField = instance.config.groupField;
      this.activeChart = instance.type;
      this.chartData = instance.data;
      
      this.$nextTick(() => {
        this.renderChart();
      });
    },
    
    removeChart(id) {
      this.chartInstances = this.chartInstances.filter(chart => chart.id !== id);
      localStorage.setItem('chartHistory', JSON.stringify(this.chartInstances));
    },
    
    // === Экспорт ===
    exportChart() {
      if (!this.chartInstance) return;
      
      const link = document.createElement('a');
      link.download = `chart-${this.activeChart}-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = this.chartInstance.toBase64Image();
      link.click();
    },
    
    exportData(format) {
      let content, mimeType, extension;
      
      if (format === 'csv') {
        const headers = this.headers.join(',');
        const rows = this.data.map(row => 
          this.headers.map(header => {
            const value = row[header];
            // Экранируем кавычки и запятые
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        );
        content = [headers, ...rows].join('\n');
        mimeType = 'text/csv';
        extension = 'csv';
      } else {
        content = JSON.stringify(this.data, null, 2);
        mimeType = 'application/json';
        extension = 'json';
      }
      
      const blob = new Blob([content], { type: mimeType });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `data-${new Date().toISOString().slice(0, 10)}.${extension}`;
      link.click();
      URL.revokeObjectURL(link.href);
    },
    
    // === Управление состоянием ===
    togglePreview() {
      this.showFullPreview = !this.showFullPreview;
    },
    
    clearData() {
      this.data = [];
      this.headers = [];
      this.selectedFileName = '';
      this.$refs.fileInput.value = '';
      this.showFullPreview = false;
      this.chartData = {};
      
      if (this.chartInstance) {
        this.chartInstance.destroy();
        this.chartInstance = null;
      }
      
      localStorage.removeItem(this.cacheKey);
    },
    
    toggleFullscreen() {
      this.isFullscreen = !this.isFullscreen;
      
      if (this.isFullscreen) {
        document.documentElement.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
      
      // Перерисовываем график при изменении размера
      setTimeout(() => {
        if (this.chartInstance) {
          this.chartInstance.resize();
        }
      }, 100);
    },
    
    // === Кэширование ===
    saveToCache() {
      const cacheData = {
        data: this.data,
        headers: this.headers,
        fileName: this.selectedFileName,
        timestamp: Date.now()
      };
      
      try {
        localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
      } catch (error) {
        console.warn('Не удалось сохранить в кэш:', error);
      }
    },
    
    loadFromCache() {
      try {
        const cached = localStorage.getItem(this.cacheKey);
        if (cached) {
          const { data, headers, fileName, timestamp } = JSON.parse(cached);
          
          // Проверяем срок годности (1 день)
          const isExpired = Date.now() - timestamp > 24 * 60 * 60 * 1000;
          
          if (!isExpired) {
            this.data = data;
            this.headers = headers;
            this.selectedFileName = fileName;
            this.analyzeData();
            this.previewRows = data.slice(0, 50);
            this.autoSelectFields();
            return true;
          }
        }
      } catch (error) {
        console.warn('Не удалось загрузить из кэша:', error);
      }
      return false;
    },
    
    // === Вспомогательные методы ===
    debounce(func, wait) {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    }
  },
  watch: {
    selectedXField() {
      if (this.selectedXField && this.selectedYField) {
        this.prepareChartData();
      }
    },
    
    selectedYField() {
      if (this.selectedXField && this.selectedYField) {
        this.prepareChartData();
      }
    },
    
    selectedGroupField() {
      if (this.selectedXField && this.selectedYField) {
        this.prepareChartData();
      }
    },
    
    activeChart() {
      if (this.selectedXField && this.selectedYField) {
        this.prepareChartData();
      }
    }
  },
  mounted() {
    // Загружаем историю графиков
    try {
      const history = localStorage.getItem('chartHistory');
      if (history) {
        this.chartInstances = JSON.parse(history);
      }
    } catch (error) {
      console.warn('Не удалось загрузить историю графиков:', error);
    }
    
    // Пытаемся загрузить данные из кэша
    this.loadFromCache();
    
    // Обработчик изменения размера окна
    window.addEventListener('resize', this.debounce(() => {
      if (this.chartInstance) {
        this.chartInstance.resize();
      }
    }, 300));
    
    // Обработчик выхода из полноэкранного режима
    document.addEventListener('fullscreenchange', () => {
      this.isFullscreen = !!document.fullscreenElement;
    });
  },
  beforeUnmount() {
    // Очищаем графики
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
    
    // Удаляем обработчики событий
    window.removeEventListener('resize', this.debounce);
    document.removeEventListener('fullscreenchange', this.fullscreenHandler);
  }
};
</script>

<style scoped>
.csv-analyzer {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Загрузка файла */
.upload-section {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.file-input-container {
  display: flex;
  gap: 16px;
  align-items: center;
  margin: 16px 0;
}

.file-input-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  flex: 1;
}

.file-input {
  display: none;
}

.file-input-button {
  padding: 10px 20px;
  background: #4f46e5;
  color: white;
  border-radius: 6px;
  font-weight: 500;
  transition: background 0.2s;
}

.file-input-button:hover {
  background: #4338ca;
}

.file-input-name {
  color: #6b7280;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.clear-button {
  padding: 10px 20px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.clear-button:hover {
  background: #dc2626;
}

.parse-settings {
  display: flex;
  gap: 24px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.setting-select {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
}

/* Предпросмотр данных */
.data-preview {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.preview-info {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.preview-toggle, .export-button {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.preview-toggle:hover, .export-button:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.table-container {
  overflow-x: auto;
  margin: 16px 0;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

th {
  background: #f9fafb;
  padding: 12px;
  border-bottom: 2px solid #e5e7eb;
  font-weight: 600;
  text-align: left;
  position: relative;
  min-width: 120px;
}

td {
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

tr:hover {
  background: #f9fafb;
}

.header-type {
  font-size: 11px;
  color: #6b7280;
  font-weight: normal;
  margin-top: 4px;
}

.preview-note {
  text-align: center;
  padding: 12px;
  color: #6b7280;
  font-size: 14px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

/* Анализ данных */
.data-analysis {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.stat-card {
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.stat-header {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
  font-size: 14px;
}

.stat-type {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 12px;
  padding: 2px 8px;
  background: #e2e8f0;
  border-radius: 4px;
  display: inline-block;
}

.stat-numbers, .stat-strings {
  font-size: 13px;
  color: #475569;
  line-height: 1.5;
}

/* Настройки графиков */
.chart-controls {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.field-selectors {
  display: flex;
  gap: 24px;
  margin: 20px 0;
  flex-wrap: wrap;
}

.field-selector {
  flex: 1;
  min-width: 200px;
}

.field-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  margin-top: 8px;
  font-size: 14px;
}

.field-select:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.chart-types {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.chart-type-button {
  padding: 10px 20px;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.chart-type-button:hover {
  border-color: #4f46e5;
  color: #4f46e5;
}

.chart-type-button.active {
  background: #4f46e5;
  color: white;
  border-color: #4f46e5;
}

/* Графики */
.charts-section {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-actions {
  display: flex;
  gap: 12px;
}

.chart-action-button {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.chart-action-button:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.chart-container {
  position: relative;
  width: 100%;
  height: 500px;
  margin: 20px 0;
}

.chart-container.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  background: white;
  padding: 40px;
}

.chart-summary {
  padding: 16px;
  background: #f0f9ff;
  border-radius: 8px;
  margin-top: 20px;
  border-left: 4px solid #0ea5e9;
}

.summary-content {
  font-size: 14px;
  color: #0369a1;
}

/* Управление графиками */
.chart-management {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-history {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.chart-history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.chart-history-item:hover {
  background: #f9fafb;
  border-color: #4f46e5;
}

.history-title {
  font-weight: 500;
  flex: 1;
}

.history-info {
  display: flex;
  gap: 16px;
  color: #6b7280;
  font-size: 13px;
}

.remove-chart {
  padding: 4px 12px;
  border: none;
  background: #ef4444;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  transition: background 0.2s;
}

.remove-chart:hover {
  background: #dc2626;
}

/* Индикатор загрузки */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e5e7eb;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Сообщения об ошибках */
.error-messages {
  margin-bottom: 20px;
}

.error {
  padding: 16px;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #991b1b;
  margin-bottom: 12px;
  font-size: 14px;
}

/* Адаптивность */
@media (max-width: 768px) {
  .csv-analyzer {
    padding: 12px;
  }
  
  .parse-settings {
    flex-direction: column;
    gap: 16px;
  }
  
  .field-selectors {
    flex-direction: column;
  }
  
  .chart-types {
    justify-content: center;
  }
  
  .chart-container {
    height: 400px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .preview-info {
    flex-direction: column;
    align-items: stretch;
  }
  
  .preview-info > * {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .file-input-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .file-input-label {
    flex-direction: column;
    align-items: stretch;
  }
  
  .chart-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .chart-history-item {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .history-info {
    justify-content: space-between;
  }
}
</style>