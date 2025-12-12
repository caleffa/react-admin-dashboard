import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Filter,
  Download,
  MoreVertical,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

const ResponsiveDataTable = ({
  data,
  columns,
  itemsPerPage = 10,
  searchable = true,
  downloadable = false,
  onRowClick,
  actions = []
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showFilters, setShowFilters] = useState(false);

  // Filtrar datos
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter(item =>
      columns.some(column =>
        String(item[column.key] || '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm, columns]);

  // Ordenar datos
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Paginación
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  // Handlers
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Componente de fila para móvil
  const MobileRow = ({ item }) => (
    <div 
      className="bg-white rounded-lg shadow p-4 mb-3 border border-gray-200 hover:shadow-md transition-shadow"
      onClick={() => onRowClick && onRowClick(item)}
    >
      <div className="space-y-2">
        {columns.slice(0, 2).map(column => (
          <div key={column.key} className="flex justify-between">
            <span className="text-sm font-medium text-gray-600">
              {column.label}:
            </span>
            <span className="text-sm text-gray-800">
              {column.render ? column.render(item[column.key], item) : item[column.key]}
            </span>
          </div>
        ))}
        
        {columns.length > 2 && (
          <div className="pt-2 border-t border-gray-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowFilters(!showFilters);
              }}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Ver más detalles
            </button>
          </div>
        )}
        
        {actions.length > 0 && (
          <div className="pt-2 border-t border-gray-100">
            <div className="flex space-x-2">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick(item);
                  }}
                  className={`px-3 py-1 text-xs rounded-full flex items-center space-x-1 ${
                    action.variant === 'danger'
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : action.variant === 'warning'
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {action.icon}
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header con controles */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            {searchable && (
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter size={18} className="text-gray-600" />
            </button>
            
            {downloadable && (
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download size={18} className="text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filtros (opcional) */}
      {showFilters && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Aquí puedes agregar más filtros según necesites */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ordenar por
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => handleSort(e.target.value)}
                value={sortConfig.key || ''}
              >
                <option value="">Seleccionar</option>
                {columns.map(column => (
                  <option key={column.key} value={column.key}>
                    {column.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tabla (Desktop) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(column => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {sortConfig.key === column.key && (
                      <span className="text-gray-400">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedData.map((item, index) => (
              <tr
                key={index}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onRowClick && onRowClick(item)}
              >
                {columns.map(column => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {column.render ? column.render(item[column.key], item) : item[column.key]}
                    </div>
                  </td>
                ))}
                {actions.length > 0 && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {actions.map((action, actionIndex) => (
                        <button
                          key={actionIndex}
                          onClick={(e) => {
                            e.stopPropagation();
                            action.onClick(item);
                          }}
                          className={`px-3 py-1 rounded-full text-xs flex items-center space-x-1 ${
                            action.variant === 'danger'
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : action.variant === 'warning'
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                        >
                          {action.icon}
                          <span>{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vista Móvil */}
      <div className="md:hidden p-4">
        {paginatedData.map((item, index) => (
          <MobileRow key={index} item={item} />
        ))}
      </div>

      {/* Paginación */}
      {sortedData.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
              <span className="font-medium">
                {Math.min(startIndex + itemsPerPage, sortedData.length)}
              </span>{' '}
              de <span className="font-medium">{sortedData.length}</span> resultados
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronsLeft size={16} />
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft size={16} />
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 rounded-lg ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sin resultados */}
      {sortedData.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">No se encontraron resultados</div>
          <p className="text-gray-500 text-sm">
            {searchTerm ? 'Intenta con otros términos de búsqueda' : 'No hay datos disponibles'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ResponsiveDataTable;