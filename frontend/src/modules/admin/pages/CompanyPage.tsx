import { useState, useEffect } from 'react';
import { companyService } from '../../../core/services/adminService';
import type { CompanyData, CompanyUpdateData } from '../../../core/services/adminService';
import { Building2, Globe, Mail, Phone, MapPin, DollarSign, Save, Upload, AlertCircle } from 'lucide-react';

export default function CompanyPage() {
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState<CompanyUpdateData>({
    razon_social: '',
    nombre_comercial: '',
    ruc: '',
    direccion_fiscal: '',
    telefono_contacto: '',
    email_contacto: '',
    sitio_web: '',
    representante_legal: '',
    pais: 'EC',
    moneda: 'USD',
    estado: 'activo',
  });
  
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    loadCompany();
  }, []);

  const loadCompany = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await companyService.getCompany();
      setCompany(data);
      
      // Cargar datos al formulario
      setFormData({
        razon_social: data.razon_social,
        nombre_comercial: data.nombre_comercial || '',
        ruc: data.ruc,
        direccion_fiscal: data.direccion_fiscal || '',
        telefono_contacto: data.telefono_contacto || '',
        email_contacto: data.email_contacto || '',
        sitio_web: data.sitio_web || '',
        representante_legal: data.representante_legal || '',
        pais: data.pais,
        moneda: data.moneda,
        estado: data.estado,
      });
      
      if (data.logo) {
        setLogoPreview(data.logo);
      }
    } catch (err: any) {
      console.error('Error loading company:', err);
      setError(err?.response?.data?.detail || 'Error al cargar datos de la empresa.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, logo: file }));
      
      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.razon_social || !formData.ruc) {
      setError('La Razón Social y el RUC son obligatorios.');
      return;
    }
    
    if (formData.ruc && formData.ruc.length < 10) {
      setError('El RUC debe tener al menos 10 caracteres.');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const updatedCompany = await companyService.updateCompany(formData);
      setCompany(updatedCompany);
      setSuccess('Datos de la empresa actualizados correctamente.');
      setIsEditing(false);
      
      // Actualizar logo preview si cambió
      if (updatedCompany.logo) {
        setLogoPreview(updatedCompany.logo);
      }
    } catch (err: any) {
      console.error('Error updating company:', err);
      setError(err?.response?.data?.detail || err?.response?.data?.ruc?.[0] || 'Error al actualizar la empresa.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Cargando datos de la empresa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase text-slate-500 font-semibold">Configuración</p>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-8 h-8 text-blue-600" />
            Perfil Corporativo
          </h1>
          <p className="text-slate-600 mt-1">Información fiscal y datos generales de la organización.</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Editar Información
          </button>
        )}
      </div>

      {/* Alertas */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-green-900">Éxito</h3>
            <p className="text-sm text-green-700">{success}</p>
          </div>
        </div>
      )}

      {/* Vista de Lectura */}
      {!isEditing && company && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Logo y Datos Principales */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Logo Corporativo</h2>
              <div className="flex flex-col items-center">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-48 h-48 object-contain rounded-lg border border-slate-200 mb-4" />
                ) : (
                  <div className="w-48 h-48 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                    <Building2 className="w-16 h-16 text-slate-400" />
                  </div>
                )}
                <div className="text-center">
                  <h3 className="font-bold text-xl text-slate-900">{company.nombre_comercial || company.razon_social}</h3>
                  <p className="text-sm text-slate-600 mt-1">{company.razon_social}</p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                    company.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {company.estado === 'activo' ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Información Detallada */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información Fiscal */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Información Fiscal
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700">RUC/NIT</label>
                  <p className="text-slate-900 mt-1">{company.ruc}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Representante Legal</label>
                  <p className="text-slate-900 mt-1">{company.representante_legal || 'No especificado'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    Dirección Fiscal
                  </label>
                  <p className="text-slate-900 mt-1">{company.direccion_fiscal || 'No especificada'}</p>
                </div>
              </div>
            </div>

            {/* Información de Contacto */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Información de Contacto</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-500" />
                    Teléfono
                  </label>
                  <p className="text-slate-900 mt-1">{company.telefono_contacto || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-500" />
                    Email
                  </label>
                  <p className="text-slate-900 mt-1">{company.email_contacto || 'No especificado'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-slate-500" />
                    Sitio Web
                  </label>
                  <p className="text-slate-900 mt-1">
                    {company.sitio_web ? (
                      <a href={company.sitio_web} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {company.sitio_web}
                      </a>
                    ) : 'No especificado'}
                  </p>
                </div>
              </div>
            </div>

            {/* Configuración Regional */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Configuración Regional</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700">País</label>
                  <p className="text-slate-900 mt-1">{company.pais}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-slate-500" />
                    Moneda
                  </label>
                  <p className="text-slate-900 mt-1">{company.moneda}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulario de Edición */}
      {isEditing && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Logo Upload */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Logo Corporativo</h2>
                <div className="flex flex-col items-center">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo Preview" className="w-48 h-48 object-contain rounded-lg border border-slate-200 mb-4" />
                  ) : (
                    <div className="w-48 h-48 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                      <Building2 className="w-16 h-16 text-slate-400" />
                    </div>
                  )}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    <span className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                      <Upload className="w-4 h-4" />
                      Subir Logo
                    </span>
                  </label>
                  <p className="text-xs text-slate-500 mt-2 text-center">PNG, JPG hasta 2MB</p>
                </div>
              </div>
            </div>

            {/* Formulario */}
            <div className="lg:col-span-2 space-y-6">
              {/* Información Legal */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Información Legal</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Razón Social <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="razon_social"
                      value={formData.razon_social}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nombre Legal de la Empresa"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre Comercial</label>
                    <input
                      type="text"
                      name="nombre_comercial"
                      value={formData.nombre_comercial}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Marca o Nombre Comercial"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      RUC/NIT <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="ruc"
                      value={formData.ruc}
                      onChange={handleInputChange}
                      required
                      minLength={10}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1234567890001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Representante Legal</label>
                    <input
                      type="text"
                      name="representante_legal"
                      value={formData.representante_legal}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nombre del Representante"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Dirección Fiscal</label>
                    <textarea
                      name="direccion_fiscal"
                      value={formData.direccion_fiscal}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Dirección completa"
                    />
                  </div>
                </div>
              </div>

              {/* Información de Contacto */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Información de Contacto</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Teléfono</label>
                    <input
                      type="tel"
                      name="telefono_contacto"
                      value={formData.telefono_contacto}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+593 99 999 9999"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email de Contacto</label>
                    <input
                      type="email"
                      name="email_contacto"
                      value={formData.email_contacto}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="info@empresa.com"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Sitio Web</label>
                    <input
                      type="url"
                      name="sitio_web"
                      value={formData.sitio_web}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://www.empresa.com"
                    />
                  </div>
                </div>
              </div>

              {/* Configuración Regional */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Configuración Regional</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">País</label>
                    <select
                      name="pais"
                      value={formData.pais}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="EC">Ecuador</option>
                      <option value="CO">Colombia</option>
                      <option value="PE">Perú</option>
                      <option value="MX">México</option>
                      <option value="CL">Chile</option>
                      <option value="AR">Argentina</option>
                      <option value="US">Estados Unidos</option>
                      <option value="ES">España</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Moneda</label>
                    <select
                      name="moneda"
                      value={formData.moneda}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="USD">Dólar (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                      <option value="COP">Peso Colombiano (COP)</option>
                      <option value="PEN">Sol Peruano (PEN)</option>
                      <option value="MXN">Peso Mexicano (MXN)</option>
                      <option value="CLP">Peso Chileno (CLP)</option>
                      <option value="ARS">Peso Argentino (ARS)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Estado</label>
                    <select
                      name="estado"
                      value={formData.estado}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    loadCompany(); // Recargar datos originales
                  }}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

