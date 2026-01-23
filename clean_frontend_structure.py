#!/usr/bin/env python3
"""
🔧 SCRIPT DE LIMPIEZA QUIRÚRGICA DE DIRECTORIOS - FRONTEND
=====================================================
Autor: DevOps Engineer
Fecha: 21 de Enero, 2026
Propósito: Consolidar y limpiar la estructura de directorios del frontend
"""

import os
import shutil
from pathlib import Path
from typing import List, Set, Tuple
import logging

# ==================== CONFIGURACIÓN ====================
DRY_RUN = False  # ⚠️ CAMBIAR A False PARA EJECUTAR REALMENTE
PROJECT_ROOT = Path(r"C:\Users\toled\OneDrive\Escritorio\Proyecto punto pymes")
FRONTEND_DIR = PROJECT_ROOT / "frontend"
TARGET_SRC_DIR = FRONTEND_DIR / "src"

# Carpetas a ignorar durante el escaneo
IGNORE_FOLDERS = {'node_modules', '.git', '.vscode', 'dist', 'build', '__pycache__'}

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(levelname)s: %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== FUNCIONES PRINCIPALES ====================

def scan_directory_tree(root: Path) -> List[Path]:
    """
    📋 ESCANEO: Lista todas las carpetas recursivamente
    Ignora carpetas definidas en IGNORE_FOLDERS
    """
    logger.info("=" * 70)
    logger.info("🔍 INICIANDO ESCANEO DE DIRECTORIOS")
    logger.info("=" * 70)
    
    all_dirs = []
    for dirpath, dirnames, _ in os.walk(root):
        # Filtrar carpetas ignoradas
        dirnames[:] = [d for d in dirnames if d not in IGNORE_FOLDERS]
        
        for dirname in dirnames:
            full_path = Path(dirpath) / dirname
            all_dirs.append(full_path)
            logger.info(f"📁 Encontrado: {full_path.relative_to(PROJECT_ROOT)}")
    
    logger.info(f"\n✅ Total de directorios encontrados: {len(all_dirs)}")
    return all_dirs


def find_empty_directories(directories: List[Path]) -> List[Path]:
    """
    🗑️ DETECCIÓN DE VACÍOS: Identifica carpetas completamente vacías
    """
    logger.info("\n" + "=" * 70)
    logger.info("🗑️  DETECTANDO CARPETAS VACÍAS")
    logger.info("=" * 70)
    
    empty_dirs = []
    for dir_path in directories:
        if not dir_path.exists():
            continue
            
        # Verificar si la carpeta está completamente vacía (0 archivos recursivos)
        has_files = any(dir_path.rglob('*'))
        
        if not has_files:
            empty_dirs.append(dir_path)
            logger.warning(f"⚠️  VACÍA: {dir_path.relative_to(PROJECT_ROOT)}")
    
    logger.info(f"\n🗑️  Total de carpetas vacías: {len(empty_dirs)}")
    return empty_dirs


def delete_empty_directories(empty_dirs: List[Path]) -> None:
    """
    🗑️ ELIMINACIÓN: Borra carpetas vacías
    """
    if not empty_dirs:
        logger.info("\n✅ No hay carpetas vacías para eliminar")
        return
    
    logger.info("\n" + "=" * 70)
    logger.info("🗑️  ELIMINANDO CARPETAS VACÍAS")
    logger.info("=" * 70)
    
    for dir_path in sorted(empty_dirs, reverse=True):  # Borrar desde lo más profundo
        try:
            if DRY_RUN:
                logger.info(f"[DRY RUN] Eliminaría: {dir_path.relative_to(PROJECT_ROOT)}")
            else:
                dir_path.rmdir()
                logger.info(f"✅ Eliminado: {dir_path.relative_to(PROJECT_ROOT)}")
        except OSError as e:
            logger.error(f"❌ Error al eliminar {dir_path}: {e}")


def find_duplicate_nested_structures(root: Path) -> List[Tuple[Path, Path]]:
    """
    🔄 DETECCIÓN DE DUPLICADOS: Busca estructuras anidadas incorrectamente
    Por ejemplo: frontend/frontend/src → frontend/src
    """
    logger.info("\n" + "=" * 70)
    logger.info("🔄 DETECTANDO ESTRUCTURAS DUPLICADAS/ANIDADAS")
    logger.info("=" * 70)
    
    duplicates = []
    
    # Caso específico: frontend/frontend/src
    nested_frontend = FRONTEND_DIR / "frontend"
    if nested_frontend.exists() and nested_frontend.is_dir():
        logger.warning(f"⚠️  DUPLICADO CRÍTICO: {nested_frontend.relative_to(PROJECT_ROOT)}")
        # Agregar cada subdirectorio de frontend/frontend para fusionar
        if (nested_frontend / "src").exists():
            duplicates.append((nested_frontend, nested_frontend / "src"))
            logger.warning(f"   └─ Contendrá: {(nested_frontend / 'src').relative_to(PROJECT_ROOT)}")
    
    # Buscar otros patrones de duplicación
    patterns_to_check = [
        ("src", "src"),  # src/src
        ("pages", "pages"),  # pages/pages
        ("components", "components"),  # components/components
    ]
    
    for parent_name, child_name in patterns_to_check:
        for dirpath, dirnames, _ in os.walk(root):
            # Evitar procesar node_modules
            if any(ignore in dirpath for ignore in IGNORE_FOLDERS):
                continue
                
            if child_name in dirnames:
                parent_path = Path(dirpath)
                # Solo reportar si es realmente un duplicado (mismo nombre de carpeta)
                if parent_path.name == parent_name:
                    child_path = parent_path / child_name
                    duplicates.append((parent_path, child_path))
                    logger.warning(f"⚠️  DUPLICADO: {parent_path.relative_to(PROJECT_ROOT)} → {child_path.relative_to(PROJECT_ROOT)}")
    
    logger.info(f"\n🔄 Total de estructuras duplicadas: {len(duplicates)}")
    return duplicates


def merge_directories(source: Path, target: Path) -> Tuple[int, List[str]]:
    """
    🔄 FUSIÓN: Mueve archivos de source a target
    
    Returns:
        Tuple con (archivos_movidos, conflictos)
    """
    logger.info(f"\n🔄 Fusionando: {source.relative_to(PROJECT_ROOT)} → {target.relative_to(PROJECT_ROOT)}")
    
    files_moved = 0
    conflicts = []
    
    # Crear directorio target si no existe
    if not DRY_RUN and not target.exists():
        target.mkdir(parents=True, exist_ok=True)
    
    # Recorrer todos los archivos en source
    for item in source.rglob('*'):
        if item.is_file():
            # Calcular ruta relativa
            rel_path = item.relative_to(source)
            target_path = target / rel_path
            
            # Verificar conflictos
            if target_path.exists():
                conflicts.append(str(rel_path))
                logger.warning(f"⚠️  CONFLICTO: {rel_path} ya existe en destino")
            else:
                if DRY_RUN:
                    logger.info(f"[DRY RUN] Movería: {rel_path}")
                else:
                    # Crear directorios intermedios si no existen
                    target_path.parent.mkdir(parents=True, exist_ok=True)
                    
                    # Mover archivo
                    shutil.move(str(item), str(target_path))
                    logger.info(f"✅ Movido: {rel_path}")
                
                files_moved += 1
    
    return files_moved, conflicts


def remove_redundant_directory(dir_path: Path) -> None:
    """
    🗑️ ELIMINACIÓN DE REDUNDANCIA: Borra carpeta redundante después de fusión
    """
    if not dir_path.exists():
        return
    
    try:
        if DRY_RUN:
            logger.info(f"[DRY RUN] Eliminaría directorio redundante: {dir_path.relative_to(PROJECT_ROOT)}")
        else:
            shutil.rmtree(dir_path)
            logger.info(f"✅ Eliminado directorio redundante: {dir_path.relative_to(PROJECT_ROOT)}")
    except OSError as e:
        logger.error(f"❌ Error al eliminar {dir_path}: {e}")


def generate_report(total_scanned: int, empty_found: int, duplicates_found: int, 
                    files_moved: int, conflicts: List[str]) -> None:
    """
    📊 REPORTE FINAL: Genera resumen de la operación
    """
    logger.info("\n" + "=" * 70)
    logger.info("📊 REPORTE FINAL DE LIMPIEZA")
    logger.info("=" * 70)
    logger.info(f"📁 Directorios escaneados: {total_scanned}")
    logger.info(f"🗑️  Carpetas vacías encontradas: {empty_found}")
    logger.info(f"🔄 Estructuras duplicadas encontradas: {duplicates_found}")
    logger.info(f"📦 Archivos movidos: {files_moved}")
    logger.info(f"⚠️  Conflictos detectados: {len(conflicts)}")
    
    if conflicts:
        logger.info("\n⚠️  ARCHIVOS EN CONFLICTO (revisar manualmente):")
        for conflict in conflicts[:10]:  # Mostrar solo los primeros 10
            logger.info(f"   - {conflict}")
        if len(conflicts) > 10:
            logger.info(f"   ... y {len(conflicts) - 10} más")
    
    logger.info("\n" + "=" * 70)
    if DRY_RUN:
        logger.info("🔒 MODO DRY_RUN ACTIVO - No se realizaron cambios reales")
        logger.info("💡 Cambia DRY_RUN = False en el script para ejecutar")
    else:
        logger.info("✅ OPERACIÓN COMPLETADA - Cambios aplicados")
    logger.info("=" * 70)


# ==================== MAIN ====================

def main():
    """
    🚀 FUNCIÓN PRINCIPAL: Orquesta toda la limpieza
    """
    logger.info("\n" + "=" * 70)
    logger.info("🚀 SCRIPT DE LIMPIEZA QUIRÚRGICA DE FRONTEND")
    logger.info("=" * 70)
    logger.info(f"📂 Directorio base: {FRONTEND_DIR}")
    logger.info(f"🎯 Directorio objetivo: {TARGET_SRC_DIR}")
    logger.info(f"🔒 Modo DRY_RUN: {'ACTIVADO ⚠️' if DRY_RUN else 'DESACTIVADO ✅'}")
    logger.info("=" * 70)
    
    # Verificar que el directorio frontend existe
    if not FRONTEND_DIR.exists():
        logger.error(f"❌ ERROR: No se encuentra el directorio {FRONTEND_DIR}")
        return
    
    # Paso 1: Escanear directorios
    all_dirs = scan_directory_tree(FRONTEND_DIR)
    
    # Paso 2: Detectar carpetas vacías
    empty_dirs = find_empty_directories(all_dirs)
    
    # Paso 3: Detectar estructuras duplicadas
    duplicates = find_duplicate_nested_structures(FRONTEND_DIR)
    
    # Paso 4: Fusionar estructuras duplicadas
    total_files_moved = 0
    all_conflicts = []
    
    # Caso especial: frontend/frontend/src debe fusionarse con frontend/src
    nested_frontend_dir = FRONTEND_DIR / "frontend"
    if nested_frontend_dir.exists():
        logger.info("\n" + "=" * 70)
        logger.info("🔄 PROCESANDO ESTRUCTURA ANIDADA: frontend/frontend")
        logger.info("=" * 70)
        
        # Fusionar contenido de frontend/frontend con frontend/
        for item in nested_frontend_dir.iterdir():
            if item.is_dir() and item.name not in IGNORE_FOLDERS:
                target_item = FRONTEND_DIR / item.name
                
                if item.name == "src":
                    # Fusionar src con el src principal
                    logger.info(f"\n🔄 Fusionando contenido de: {item.relative_to(PROJECT_ROOT)}")
                    files_moved, conflicts = merge_directories(item, TARGET_SRC_DIR)
                    total_files_moved += files_moved
                    all_conflicts.extend(conflicts)
                else:
                    # Mover otras carpetas directamente
                    if target_item.exists():
                        logger.warning(f"⚠️  Ya existe: {target_item.relative_to(PROJECT_ROOT)}")
                        files_moved, conflicts = merge_directories(item, target_item)
                        total_files_moved += files_moved
                        all_conflicts.extend(conflicts)
                    else:
                        if DRY_RUN:
                            logger.info(f"[DRY RUN] Movería carpeta: {item.relative_to(PROJECT_ROOT)} → {target_item.relative_to(PROJECT_ROOT)}")
                        else:
                            shutil.move(str(item), str(target_item))
                            logger.info(f"✅ Movido: {item.relative_to(PROJECT_ROOT)} → {target_item.relative_to(PROJECT_ROOT)}")
        
        # Eliminar frontend/frontend después de la fusión
        remove_redundant_directory(nested_frontend_dir)
    
    # Procesar otros duplicados
    if duplicates:
        logger.info("\n" + "=" * 70)
        logger.info("🔄 PROCESANDO OTRAS ESTRUCTURAS DUPLICADAS")
        logger.info("=" * 70)
        
        for parent, child in duplicates:
            # Saltar si ya procesamos frontend/frontend
            if "frontend/frontend" in str(child):
                continue
                
            target = parent
            files_moved, conflicts = merge_directories(child, target)
            total_files_moved += files_moved
            all_conflicts.extend(conflicts)
            
            # Eliminar la carpeta duplicada ahora vacía
            remove_redundant_directory(child)
    
    # Paso 5: Eliminar carpetas vacías
    delete_empty_directories(empty_dirs)
    
    # Paso 6: Generar reporte
    generate_report(
        total_scanned=len(all_dirs),
        empty_found=len(empty_dirs),
        duplicates_found=len(duplicates),
        files_moved=total_files_moved,
        conflicts=all_conflicts
    )


if __name__ == "__main__":
    main()
