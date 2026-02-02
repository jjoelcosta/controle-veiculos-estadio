import { supabase } from '../lib/supabase';

const normalizeText = (value) => 
  value ? value.trim().replace(/\s+/g, ' ') : null;

const handleDbError = (error) => {
  if (error?.code === '23505') {
    throw new Error('❌ Registro duplicado.');
  }
  throw error;
};

/* ================================
   PROPRIETÁRIOS
================================ */

const loadOwners = async () => {
  const { data, error } = await supabase
    .from('owners')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  
  return (data || []).map(o => ({
    id: o.id,
    name: o.name,
    phone: o.phone,
    company: o.company,
    position: o.position,
    sector: o.sector,
    createdAt: new Date(o.created_at).toLocaleString('pt-BR'),
    updatedAt: o.updated_at ? new Date(o.updated_at).toLocaleString('pt-BR') : null
  }));
};

const addOwner = async (ownerData) => {
  try {
    const payload = {
      name: normalizeText(ownerData.name),
      phone: normalizeText(ownerData.phone),
      company: normalizeText(ownerData.company),
      sector: normalizeText(ownerData.sector),
      position: normalizeText(ownerData.position),
    };

    // Validar duplicidade por NOME + EMPRESA
    const { data: existing } = await supabase
      .from('owners')
      .select('id')
      .ilike('name', payload.name)
      .ilike('company', payload.company)
      .limit(1);

    if (existing?.length) {
      throw new Error('❌ Já existe um proprietário com este nome nesta empresa');
    }

    const { data, error } = await supabase
      .from('owners')
      .insert(payload)
      .select()
      .single();

    if (error) handleDbError(error);
    
    return {
      id: data.id,
      name: data.name,
      phone: data.phone,
      company: data.company,
      position: data.position,
      sector: data.sector,
      createdAt: new Date(data.created_at).toLocaleString('pt-BR')
    };
  } catch (err) {
    throw err;
  }
};

const updateOwner = async (id, ownerData) => {
  try {
    const payload = {
      name: normalizeText(ownerData.name),
      phone: normalizeText(ownerData.phone),
      company: normalizeText(ownerData.company),
      sector: normalizeText(ownerData.sector),
      position: normalizeText(ownerData.position),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('owners')
      .update(payload)
      .eq('id', id);

    if (error) handleDbError(error);
    
    return true;
  } catch (err) {
    throw err;
  }
};

const deleteOwner = async (id) => {
  const { error } = await supabase
    .from('owners')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

/* ================================
   VEÍCULOS
================================ */

const loadVehicles = async () => {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .order('plate', { ascending: true });

  if (error) throw error;
  
  return (data || []).map(v => ({
    id: v.id,
    plate: v.plate,
    brand: v.brand,
    model: v.model,
    type: v.type,
    parkingLocation: v.parking_location,
    ownerId: v.owner_id,
    createdAt: new Date(v.created_at).toLocaleString('pt-BR'),
    updatedAt: v.updated_at ? new Date(v.updated_at).toLocaleString('pt-BR') : null
  }));
};

const addVehicle = async (vehicleData) => {
  try {
    const payload = {
      plate: normalizeText(vehicleData.plate)?.toUpperCase(),
      type: normalizeText(vehicleData.type),
      brand: normalizeText(vehicleData.brand),
      model: normalizeText(vehicleData.model),
      parking_location: normalizeText(vehicleData.parkingLocation),
      owner_id: vehicleData.ownerId,
    };

    const { data, error } = await supabase
      .from('vehicles')
      .insert(payload)
      .select()
      .single();

    if (error) handleDbError(error);
    
    return {
      id: data.id,
      plate: data.plate,
      brand: data.brand,
      model: data.model,
      type: data.type,
      parkingLocation: data.parking_location,
      ownerId: data.owner_id,
      createdAt: new Date(data.created_at).toLocaleString('pt-BR')
    };
  } catch (err) {
    throw err;
  }
};

const updateVehicle = async (id, vehicleData) => {
  try {
    const payload = {
      plate: normalizeText(vehicleData.plate)?.toUpperCase(),
      type: normalizeText(vehicleData.type),
      brand: normalizeText(vehicleData.brand),
      model: normalizeText(vehicleData.model),
      parking_location: normalizeText(vehicleData.parkingLocation),
      owner_id: vehicleData.ownerId,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('vehicles')
      .update(payload)
      .eq('id', id);

    if (error) handleDbError(error);
    
    return true;
  } catch (err) {
    throw err;
  }
};

const deleteVehicle = async (id) => {
  const { error } = await supabase
    .from('vehicles')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

/* ================================
   VEÍCULOS TERCEIROS
================================ */

const loadThirdPartyVehicles = async () => {
  try {
    const { data, error } = await supabase
      .from('third_party_vehicles')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(v => ({
      id: v.id,
      plate: v.plate,
      brand: v.brand,
      model: v.model,
      color: v.color,
      vehicleType: v.vehicle_type,
      driverName: v.driver_name,
      driverPhone: v.driver_phone,
      company: v.company,
      serviceType: v.service_type,
      notes: v.notes,
      createdAt: new Date(v.created_at).toLocaleString('pt-BR'),
      updatedAt: v.updated_at ? new Date(v.updated_at).toLocaleString('pt-BR') : null
    }));
  } catch (err) {
    console.error('Erro ao carregar veículos terceiros:', err);
    throw err;
  }
};

const addThirdPartyVehicle = async (vehicleData) => {
  try {
    const normalizedPlate = normalizeText(vehicleData.plate)?.toUpperCase();

    // Verificar duplicata
    const { data: existing } = await supabase
      .from('third_party_vehicles')
      .select('id')
      .eq('plate', normalizedPlate)
      .is('deleted_at', null)
      .single();

    if (existing) {
      throw new Error(`Veículo com placa ${normalizedPlate} já cadastrado`);
    }

    const payload = {
      plate: normalizedPlate,
      brand: normalizeText(vehicleData.brand),
      model: normalizeText(vehicleData.model),
      color: normalizeText(vehicleData.color),
      vehicle_type: normalizeText(vehicleData.vehicleType) || 'Carro',
      driver_name: normalizeText(vehicleData.driverName),
      driver_phone: normalizeText(vehicleData.driverPhone),
      company: normalizeText(vehicleData.company),
      service_type: normalizeText(vehicleData.serviceType),
      notes: normalizeText(vehicleData.notes),
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('third_party_vehicles')
      .insert([payload])
      .select()
      .single();

    if (error) handleDbError(error);
    
    return {
      id: data.id,
      plate: data.plate,
      brand: data.brand,
      model: data.model,
      color: data.color,
      vehicleType: data.vehicle_type,
      driverName: data.driver_name,
      driverPhone: data.driver_phone,
      company: data.company,
      serviceType: data.service_type,
      notes: data.notes,
      createdAt: new Date(data.created_at).toLocaleString('pt-BR')
    };
  } catch (err) {
    console.error('Erro ao adicionar veículo terceiro:', err);
    throw err;
  }
};

const updateThirdPartyVehicle = async (id, vehicleData) => {
  try {
    const payload = {
      plate: normalizeText(vehicleData.plate)?.toUpperCase(),
      brand: normalizeText(vehicleData.brand),
      model: normalizeText(vehicleData.model),
      color: normalizeText(vehicleData.color),
      vehicle_type: normalizeText(vehicleData.vehicleType),
      driver_name: normalizeText(vehicleData.driverName),
      driver_phone: normalizeText(vehicleData.driverPhone),
      company: normalizeText(vehicleData.company),
      service_type: normalizeText(vehicleData.serviceType),
      notes: normalizeText(vehicleData.notes),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('third_party_vehicles')
      .update(payload)
      .eq('id', id);

    if (error) handleDbError(error);
    
    return true;
  } catch (err) {
    console.error('Erro ao atualizar veículo terceiro:', err);
    throw err;
  }
};

const deleteThirdPartyVehicle = async (id) => {
  try {
    const { error } = await supabase
      .from('third_party_vehicles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    
    return true;
  } catch (err) {
    console.error('Erro ao deletar veículo terceiro:', err);
    throw err;
  }
};

/* ================================
   ITENS DE EMPRÉSTIMO (CATÁLOGO)
================================ */

const loadLoanItems = async () => {
  try {
    const { data, error } = await supabase
      .from('loan_items')
      .select('*')
      .eq('active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;

    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      description: item.description,
      quantityTotal: item.quantity_total ?? 0,
      quantityAvailable: item.quantity_available ?? 0,
      unitValue: item.unit_value ?? 0,
      active: item.active
    }));
  } catch (err) {
    console.error('Erro ao carregar itens:', err);
    throw err;
  }
};

const updateLoanItemQuantity = async (itemId, quantityTotal, quantityAvailable) => {
  try {
    const { error } = await supabase
      .from('loan_items')
      .update({
        quantity_total: quantityTotal,
        quantity_available: quantityAvailable,
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Erro ao atualizar quantidade:', err);
    throw err;
  }
};

/* ================================
   EMPRÉSTIMOS
================================ */

const loadLoans = async () => {
  try {
    const { data, error } = await supabase
      .from('loans')
      .select(`
        *,
        loan_items_detail (
          id,
          item_id,
          quantity_borrowed,
          quantity_returned,
          condition,
          damage_fee,
          payment_method,
          payment_date,
          notes,
          loan_items (
            name,
            category,
            unit_value
          )
        )
      `)
      .order('loan_date', { ascending: false });

    if (error) throw error;

    return (data || []).map(loan => ({
      id: loan.id,
      company: loan.company,
      requesterName: loan.requester_name,
      requesterCpf: loan.requester_cpf,
      requesterPhone: loan.requester_phone,
      location: loan.location,
      deliveredBy: loan.delivered_by,
      returnedBy: loan.returned_by,
      loanDate: loan.loan_date,
      expectedReturnDate: loan.expected_return_date,
      actualReturnDate: loan.actual_return_date,
      status: loan.status,
      notes: loan.notes,
      items: loan.loan_items_detail.map(detail => ({
        id: detail.id,
        itemId: detail.item_id,
        name: detail.loan_items.name,
        category: detail.loan_items.category,
        unitValue: detail.loan_items.unit_value,
        quantityBorrowed: detail.quantity_borrowed,
        quantityReturned: detail.quantity_returned,
        condition: detail.condition,
        damageFee: detail.damage_fee,
        paymentMethod: detail.payment_method,
        paymentDate: detail.payment_date,
        notes: detail.notes
      })),
      createdAt: new Date(loan.created_at).toLocaleString('pt-BR')
    }));
  } catch (err) {
    console.error('Erro ao carregar empréstimos:', err);
    throw err;
  }
};

const addLoan = async (loanData) => {
  try {
    // 1. Criar empréstimo
    const { data: loanRecord, error: loanError } = await supabase
      .from('loans')
      .insert({
        company: normalizeText(loanData.company),
        requester_name: normalizeText(loanData.requesterName),
        requester_cpf: normalizeText(loanData.requesterCpf),
        requester_phone: normalizeText(loanData.requesterPhone),
        location: normalizeText(loanData.location),
        delivered_by: normalizeText(loanData.deliveredBy),
        loan_date: loanData.loanDate || new Date().toISOString(),
        expected_return_date: loanData.expectedReturnDate,
        status: 'emprestado',
        notes: normalizeText(loanData.notes)
      })
      .select()
      .single();

    if (loanError) throw loanError;

    // 2. Adicionar itens do empréstimo
    const itemsToInsert = loanData.items.map(item => ({
      loan_id: loanRecord.id,
      item_id: item.itemId,
      quantity_borrowed: item.quantity
    }));

    const { error: detailError } = await supabase
      .from('loan_items_detail')
      .insert(itemsToInsert);

    if (detailError) throw detailError;

    // 3. Atualizar quantidade disponível dos itens
    for (const item of loanData.items) {
      const { data: currentItem } = await supabase
        .from('loan_items')
        .select('quantity_available')
        .eq('id', item.itemId)
        .single();

      if (currentItem) {
        await supabase
          .from('loan_items')
          .update({
            quantity_available: currentItem.quantity_available - item.quantity
          })
          .eq('id', item.itemId);
      }
    }

    return loanRecord;
  } catch (err) {
    console.error('Erro ao criar empréstimo:', err);
    throw err;
  }
};

const updateLoanStatus = async (loanId, status, returnData = null) => {
  try {
    const updateData = {
      status,
      updated_at: new Date().toISOString()
    };

    if (returnData) {
      updateData.actual_return_date = returnData.actualReturnDate || new Date().toISOString();
      updateData.returned_by = normalizeText(returnData.returnedBy);
    }

    const { error } = await supabase
      .from('loans')
      .update(updateData)
      .eq('id', loanId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Erro ao atualizar status:', err);
    throw err;
  }
};

const updateLoanItemReturn = async (detailId, returnData) => {
  try {
    const { error } = await supabase
      .from('loan_items_detail')
      .update({
        quantity_returned: returnData.quantityReturned,
        condition: returnData.condition,
        damage_fee: returnData.damageFee || 0,
        payment_method: returnData.paymentMethod,
        payment_date: returnData.paymentDate,
        notes: normalizeText(returnData.notes)
      })
      .eq('id', detailId);

    if (error) throw error;

    // Atualizar quantidade disponível do item
    if (returnData.quantityReturned > 0 && returnData.condition === 'OK') {
      const { data: detail } = await supabase
        .from('loan_items_detail')
        .select('item_id')
        .eq('id', detailId)
        .single();

      if (detail) {
        const { data: currentItem } = await supabase
          .from('loan_items')
          .select('quantity_available')
          .eq('id', detail.item_id)
          .single();

        if (currentItem) {
          await supabase
            .from('loan_items')
            .update({
              quantity_available: currentItem.quantity_available + returnData.quantityReturned
            })
            .eq('id', detail.item_id);
        }
      }
    }

    return true;
  } catch (err) {
    console.error('Erro ao atualizar devolução:', err);
    throw err;
  }
};

const deleteLoan = async (loanId) => {
  try {
    // Restaurar quantidades antes de deletar
    const { data: details } = await supabase
      .from('loan_items_detail')
      .select('item_id, quantity_borrowed, quantity_returned')
      .eq('loan_id', loanId);

    if (details) {
      for (const detail of details) {
        const quantityToRestore = detail.quantity_borrowed - detail.quantity_returned;
        if (quantityToRestore > 0) {
          const { data: currentItem } = await supabase
            .from('loan_items')
            .select('quantity_available')
            .eq('id', detail.item_id)
            .single();

          if (currentItem) {
            await supabase
              .from('loan_items')
              .update({
                quantity_available: currentItem.quantity_available + quantityToRestore
              })
              .eq('id', detail.item_id);
          }
        }
      }
    }

    // Deletar empréstimo (cascade deleta os detalhes)
    const { error } = await supabase
      .from('loans')
      .delete()
      .eq('id', loanId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Erro ao deletar empréstimo:', err);
    throw err;
  }
};

/* ================================
   EXPORT
================================ */

export const storage = {
  loadOwners,
  loadVehicles,
  addOwner,
  updateOwner,
  deleteOwner,
  addVehicle,
  updateVehicle,
  deleteVehicle,
  loadThirdPartyVehicles,
  addThirdPartyVehicle,
  updateThirdPartyVehicle,
  deleteThirdPartyVehicle,
  loadLoanItems,
  updateLoanItemQuantity,
  loadLoans,
  addLoan,
  updateLoanStatus,
  updateLoanItemReturn,
  deleteLoan
};