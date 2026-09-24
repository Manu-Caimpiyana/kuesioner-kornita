/* ================================================
   STORAGE LAYER
   Abstraksi penyimpanan data — localStorage (fallback)
   atau Supabase (jika dikonfigurasi)
   ================================================ */

const Storage = (function () {
  'use strict';

  const LOCAL_KEY = 'kuesioner_responses';

  let supabase = null;
  let useSupabase = false;

  // ── Initialize ──

  function init() {
    const url = APP_CONFIG.SUPABASE_URL;
    const key = APP_CONFIG.SUPABASE_ANON_KEY;

    if (url && key && typeof window.supabase !== 'undefined') {
      try {
        supabase = window.supabase.createClient(url, key);
        useSupabase = true;
        console.log('[Storage] Menggunakan Supabase');
      } catch (err) {
        console.warn('[Storage] Gagal inisialisasi Supabase, fallback ke localStorage:', err);
        useSupabase = false;
      }
    } else {
      console.log('[Storage] Menggunakan localStorage (Supabase belum dikonfigurasi)');
      useSupabase = false;
    }
  }

  // ── LocalStorage Helpers ──

  function localGetAll() {
    try {
      const data = localStorage.getItem(LOCAL_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  function localSave(responses) {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(responses));
  }

  // ── Public API ──

  /**
   * Check if a response already exists for the given nama + kelas
   * @param {string} nama
   * @param {string} kelas
   * @returns {Promise<boolean>}
   */
  async function checkDuplicate(nama, kelas) {
    const namaNorm = nama.trim().toLowerCase();
    const kelasNorm = kelas.trim().toLowerCase();

    if (useSupabase) {
      try {
        const { data, error } = await supabase
          .from(APP_CONFIG.SUPABASE_TABLE)
          .select('id')
          .ilike('nama', namaNorm)
          .ilike('kelas', kelasNorm)
          .limit(1);

        if (error) throw error;
        return data && data.length > 0;
      } catch (err) {
        console.error('[Storage] Error checking duplicate:', err);
        return false;
      }
    } else {
      const responses = localGetAll();
      return responses.some(
        (r) =>
          r.nama.trim().toLowerCase() === namaNorm &&
          r.kelas.trim().toLowerCase() === kelasNorm
      );
    }
  }

  /**
   * Save a new response
   * @param {Object} responseData - { nama, kelas, answers: { q1: 3, q2: 4, ... } }
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  async function saveResponse(responseData) {
    const record = {
      nama: responseData.nama.trim(),
      kelas: responseData.kelas.trim(),
      answers: responseData.answers,
      created_at: new Date().toISOString(),
    };

    if (useSupabase) {
      try {
        const { error } = await supabase
          .from(APP_CONFIG.SUPABASE_TABLE)
          .insert([{
            nama: record.nama,
            kelas: record.kelas,
            answers: record.answers,
          }]);

        if (error) {
          // Unique constraint violation (duplicate)
          if (error.code === '23505') {
            return { success: false, error: 'duplicate' };
          }
          throw error;
        }
        return { success: true };
      } catch (err) {
        console.error('[Storage] Error saving response:', err);
        return { success: false, error: err.message };
      }
    } else {
      try {
        const responses = localGetAll();
        record.id =
          typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : Date.now().toString(36) + Math.random().toString(36).slice(2);
        responses.push(record);
        localSave(responses);
        return { success: true };
      } catch (err) {
        console.error('[Storage] Error saving to localStorage:', err);
        return { success: false, error: err.message };
      }
    }
  }

  /**
   * Get all responses
   * @returns {Promise<Array>}
   */
  async function getResponses() {
    if (useSupabase) {
      try {
        const { data, error } = await supabase
          .from(APP_CONFIG.SUPABASE_TABLE)
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (err) {
        console.error('[Storage] Error fetching responses:', err);
        return [];
      }
    } else {
      return localGetAll();
    }
  }

  /**
   * Get total number of responses
   * @returns {Promise<number>}
   */
  async function getCount() {
    if (useSupabase) {
      try {
        const { count, error } = await supabase
          .from(APP_CONFIG.SUPABASE_TABLE)
          .select('*', { count: 'exact', head: true });

        if (error) throw error;
        return count || 0;
      } catch (err) {
        console.error('[Storage] Error counting responses:', err);
        return 0;
      }
    } else {
      return localGetAll().length;
    }
  }

  /**
   * Delete a single response by id
   * @param {string} id
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  async function deleteResponse(id) {
    if (useSupabase) {
      try {
        const { error } = await supabase
          .from(APP_CONFIG.SUPABASE_TABLE)
          .delete()
          .eq('id', id);

        if (error) throw error;
        return { success: true };
      } catch (err) {
        console.error('[Storage] Error deleting response:', err);
        return { success: false, error: err.message };
      }
    } else {
      try {
        let responses = localGetAll();
        responses = responses.filter(function (r) {
          return r.id !== id;
        });
        localSave(responses);
        return { success: true };
      } catch (err) {
        console.error('[Storage] Error deleting from localStorage:', err);
        return { success: false, error: err.message };
      }
    }
  }

  /**
   * Delete all responses
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  async function deleteAllResponses() {
    if (useSupabase) {
      try {
        const { error } = await supabase
          .from(APP_CONFIG.SUPABASE_TABLE)
          .delete()
          .not('id', 'is', null);

        if (error) throw error;
        return { success: true };
      } catch (err) {
        console.error('[Storage] Error deleting all responses:', err);
        return { success: false, error: err.message };
      }
    } else {
      try {
        localStorage.removeItem(LOCAL_KEY);
        return { success: true };
      } catch (err) {
        console.error('[Storage] Error clearing localStorage:', err);
        return { success: false, error: err.message };
      }
    }
  }

  // Initialize on load
  init();

  return {
    checkDuplicate,
    saveResponse,
    getResponses,
    getCount,
    deleteResponse,
    deleteAllResponses,
  };
})();
