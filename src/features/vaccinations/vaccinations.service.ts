import { supabase } from '@/lib/supabase';
import type { VaccinationRecord, VaccinationCreatePayload, VaccinationsQueryParams, VaccinationCertificate } from './vaccinations.types';

export const vaccinationsService = {
  async getVaccinationRecords({ page = 1, pageSize = 12, search, petId }: VaccinationsQueryParams = {}) {
    const offset = (page - 1) * pageSize;
    let query: any = supabase
      .from('vaccinations')
      .select('id, pet_id, vaccine_name, date_administered, next_due, veterinarian_id, notes, certificate_url', { count: 'exact' })
      .order('date_administered', { ascending: false });

    if (petId) query = query.eq('pet_id', petId);
    if (search) {
      const term = `%${search}%`;
      query = query.or(`vaccine_name.ilike.${term},pet_id.ilike.${term}`);
    }

    const res = await query.range(offset, offset + pageSize - 1);
    if (res.error) throw new Error(res.error.message);

    return {
      items: Array.isArray(res.data) ? res.data.map((record: any) => ({
        id: record.id,
        petId: record.pet_id,
        vaccineName: record.vaccine_name,
        dateAdministered: record.date_administered,
        nextDue: record.next_due,
        veterinarianId: record.veterinarian_id,
        notes: record.notes,
        certificateUrl: record.certificate_url
      })) : [],
      total: typeof res.count === 'number' ? res.count : (res.data || []).length
    };
  },

  async getVaccinationsByPet(petId: string): Promise<VaccinationRecord[]> {
    const { data, error } = await supabase
      .from('vaccinations')
      .select('id, vaccine_name, date_administered, next_due, veterinarian_id, notes, certificate_url')
      .eq('pet_id', petId)
      .order('date_administered', { ascending: false });

    if (error) throw new Error(error.message);
    return Array.isArray(data)
      ? data.map((record: any) => ({
          id: record.id,
          petId,
          vaccineName: record.vaccine_name,
          dateAdministered: record.date_administered,
          nextDue: record.next_due,
          veterinarianId: record.veterinarian_id,
          notes: record.notes,
          certificateUrl: record.certificate_url
        }))
      : [];
  },

  async createVaccination(payload: VaccinationCreatePayload): Promise<VaccinationRecord> {
    const { data, error } = await supabase
      .from('vaccinations')
      .insert({
        pet_id: payload.petId,
        vaccine_name: payload.vaccineName,
        date_administered: payload.dateAdministered,
        next_due: payload.nextDue,
        veterinarian_id: payload.veterinarianId,
        notes: payload.notes
      })
      .select()
      .single();

    if (error || !data) throw new Error(error?.message || 'Unable to create vaccination record');
    return {
      id: data.id,
      petId: data.pet_id,
      vaccineName: data.vaccine_name,
      dateAdministered: data.date_administered,
      nextDue: data.next_due,
      veterinarianId: data.veterinarian_id,
      notes: data.notes,
      certificateUrl: data.certificate_url
    };
  },

  async getVaccinationById(id: string): Promise<VaccinationRecord | null> {
    const { data, error } = await supabase
      .from('vaccinations')
      .select('id, pet_id, vaccine_name, date_administered, next_due, veterinarian_id, notes, certificate_url')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    if (!data) return null;

    return {
      id: data.id,
      petId: data.pet_id,
      vaccineName: data.vaccine_name,
      dateAdministered: data.date_administered,
      nextDue: data.next_due,
      veterinarianId: data.veterinarian_id,
      notes: data.notes,
      certificateUrl: data.certificate_url
    };
  },

  async generateCertificate(id: string): Promise<VaccinationCertificate> {
    return {
      url: `http://localhost:4000/vaccination-certificates/${id}.pdf`,
      fileName: `vaccination-${id}.pdf`,
      issuedAt: new Date().toISOString()
    };
  },

  async attachCertificateUrl(id: string, url: string) {
    const { data, error } = await supabase
      .from('vaccinations')
      .update({ certificate_url: url })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) throw new Error(error?.message || 'Unable to attach certificate URL');

    return {
      id: data.id,
      petId: data.pet_id,
      vaccineName: data.vaccine_name,
      dateAdministered: data.date_administered,
      nextDue: data.next_due,
      veterinarianId: data.veterinarian_id,
      notes: data.notes,
      certificateUrl: data.certificate_url
    } as VaccinationRecord;
  }
};

export default vaccinationsService;
