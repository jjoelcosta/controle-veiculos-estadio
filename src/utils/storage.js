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
      .maybeSingle();

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
      loanDate: loan.loan_date?.split('T')[0],
      expectedReturnDate: loan.expected_return_date?.split('T')[0],
      actualReturnDate: loan.actual_return_date?.split('T')[0],
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
    const itemIds = loanData.items.map(item => item.itemId);
    const { data: currentItems } = await supabase
      .from('loan_items')
      .select('id, quantity_available')
      .in('id', itemIds);

    await Promise.all(
      loanData.items.map(item => {
        const current = currentItems?.find(i => i.id === item.itemId);
        if (!current) return Promise.resolve();
        return supabase
          .from('loan_items')
          .update({
            quantity_available: current.quantity_available - item.quantity
          })
          .eq('id', item.itemId);
      })
    );

    return loanRecord;
  } catch (err) {
    console.error('Erro ao criar empréstimo:', err);
    throw err;
  }
};

const updateLoan = async (loanId, loanData) => {
  try {
    const { error } = await supabase
      .from('loans')
      .update({
        company: normalizeText(loanData.company),
        requester_name: normalizeText(loanData.requesterName),
        requester_cpf: normalizeText(loanData.requesterCpf),
        requester_phone: normalizeText(loanData.requesterPhone),
        location: normalizeText(loanData.location),
        delivered_by: normalizeText(loanData.deliveredBy),
        expected_return_date: loanData.expectedReturnDate,
        notes: normalizeText(loanData.notes),
        updated_at: new Date().toISOString()
      })
      .eq('id', loanId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Erro ao atualizar empréstimo:', err);
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
        payment_method: returnData.paymentMethod || null,
        payment_date: returnData.paymentDate || null,
        notes: normalizeText(returnData.notes)
      })
      .eq('id', detailId);
    if (error) throw error;

    // Atualizar quantidade disponível do item
      const condition = (returnData.condition || '').trim().toUpperCase();
      if (returnData.quantityReturned > 0 && condition === 'OK') {
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
    // 1) Buscar detalhes do empréstimo
    const { data: details, error: detailsError } = await supabase
      .from('loan_items_detail')
      .select('item_id, quantity_borrowed, quantity_returned')
      .eq('loan_id', loanId);

    if (detailsError) throw detailsError;

    // 2) Calcular quanto precisa restaurar
    const detailsToRestore = (details || [])
      .map(d => ({
        ...d,
        toRestore: (d.quantity_borrowed || 0) - (d.quantity_returned || 0),
      }))
      .filter(d => d.toRestore > 0);

    // 3) Restaurar estoque em lote
    if (detailsToRestore.length > 0) {
      const itemIds = [...new Set(detailsToRestore.map(d => d.item_id))];

      const { data: currentItems, error: itemsError } = await supabase
        .from('loan_items')
        .select('id, quantity_available')
        .in('id', itemIds);

      if (itemsError) throw itemsError;

      await Promise.all(
        detailsToRestore.map(d => {
          const current = currentItems?.find(i => i.id === d.item_id);
          if (!current) return Promise.resolve();

          return supabase
            .from('loan_items')
            .update({
              quantity_available: (current.quantity_available || 0) + d.toRestore,
            })
            .eq('id', d.item_id);
        })
      );
    }

    // 4) Deletar empréstimo (cascade deleta detalhes)
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
   CONTROLE DE DOCUMENTOS
================================ */

const getNextDocumentNumber = async (documentType) => {
  try {
    const { data, error } = await supabase
      .from('document_control')
      .select('document_number')
      .eq('document_type', documentType)
      .order('document_number', { ascending: false })
      .limit(1);

    if (error) throw error;

    const nextNumber = data && data.length > 0 ? data[0].document_number + 1 : 1;
    
    return nextNumber;
  } catch (err) {
    console.error('Erro ao gerar número:', err);
    return 1;
  }
};

const registerDocumentNumber = async (documentType, documentNumber, loanId) => {
  try {
    const { error } = await supabase
      .from('document_control')
      .insert({
        document_type: documentType,
        document_number: documentNumber,
        loan_id: loanId
      });

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Erro ao registrar número:', err);
    throw err;
  }
};

/* ================================
   EVENTOS
================================ */

const loadEvents = async () => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        event_expenses (
          id,
          expense_type,
          expense_category,
          expense_date,
          shifts,
          quantity,
          unit_value,
          total_value,
          notes
        )
      `)
      .order('start_date', { ascending: false });

    if (error) throw error;

    return (data || []).map(event => ({
      id: event.id,
      name: event.name,
      category: event.category,
      startDate: event.start_date,
      endDate: event.end_date,
      status: event.status,
      notes: event.notes,
      createdAt: new Date(event.created_at).toLocaleString('pt-BR'),
      updatedAt: event.updated_at 
        ? new Date(event.updated_at).toLocaleString('pt-BR') 
        : null,
      expenses: (event.event_expenses || []).map(ex => ({
        id: ex.id,
        expenseType: ex.expense_type,
        expenseCategory: ex.expense_category,
        expenseDate: ex.expense_date,
        shifts: ex.shifts,
        quantity: ex.quantity,
        unitValue: ex.unit_value,
        totalValue: ex.total_value,
        notes: ex.notes
      })),
      totalExpenses: (event.event_expenses || [])
        .reduce((sum, ex) => sum + (ex.total_value || 0), 0)
    }));
  } catch (err) {
    console.error('Erro ao carregar eventos:', err);
    throw err;
  }
};

const addEvent = async (eventData) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .insert({
        name: normalizeText(eventData.name),
        category: eventData.category,
        start_date: eventData.startDate,
        end_date: eventData.endDate || eventData.startDate,
        status: eventData.status || 'planejado',
        notes: normalizeText(eventData.notes)
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Erro ao criar evento:', err);
    throw err;
  }
};

const updateEvent = async (eventId, eventData) => {
  try {
    const { error } = await supabase
      .from('events')
      .update({
        name: normalizeText(eventData.name),
        category: eventData.category,
        start_date: eventData.startDate,
        end_date: eventData.endDate || eventData.startDate,
        status: eventData.status,
        notes: normalizeText(eventData.notes),
        updated_at: new Date().toISOString()
      })
      .eq('id', eventId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Erro ao atualizar evento:', err);
    throw err;
  }
};

const deleteEvent = async (eventId) => {
  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Erro ao deletar evento:', err);
    throw err;
  }
};

/* ================================
   GASTOS DE EVENTOS
================================ */

const addEventExpense = async (expenseData) => {
  try {
    let totalValue = 0;
    if (expenseData.expenseCategory === 'pessoal') {
      totalValue = (expenseData.shifts || 1)
        * (expenseData.quantity || 1)
        * (expenseData.unitValue || 0);
    } else {
      totalValue = expenseData.unitValue || 0;
    }

    const { data, error } = await supabase
      .from('event_expenses')
      .insert({
        event_id: expenseData.eventId,
        expense_type: expenseData.expenseType,
        expense_category: expenseData.expenseCategory,
        expense_date: expenseData.expenseDate || null,
        shifts: expenseData.expenseCategory === 'pessoal'
          ? (expenseData.shifts || 1) : 1,
        quantity: expenseData.expenseCategory === 'pessoal'
          ? (expenseData.quantity || 1) : 1,
        unit_value: expenseData.unitValue || 0,
        total_value: totalValue,
        notes: normalizeText(expenseData.notes)
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Erro ao adicionar gasto:', err);
    throw err;
  }
};

const updateEventExpense = async (expenseId, expenseData) => {
  try {
    let totalValue = 0;
    if (expenseData.expenseCategory === 'pessoal') {
      totalValue = (expenseData.shifts || 1)
        * (expenseData.quantity || 1)
        * (expenseData.unitValue || 0);
    } else {
      totalValue = expenseData.unitValue || 0;
    }

    const { error } = await supabase
      .from('event_expenses')
      .update({
        expense_type: expenseData.expenseType,
        expense_category: expenseData.expenseCategory,
        expense_date: expenseData.expenseDate || null,
        shifts: expenseData.expenseCategory === 'pessoal'
          ? (expenseData.shifts || 1) : 1,
        quantity: expenseData.expenseCategory === 'pessoal'
          ? (expenseData.quantity || 1) : 1,
        unit_value: expenseData.unitValue || 0,
        total_value: totalValue,
        notes: normalizeText(expenseData.notes),
        updated_at: new Date().toISOString()
      })
      .eq('id', expenseId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Erro ao atualizar gasto:', err);
    throw err;
  }
};

const deleteEventExpense = async (expenseId) => {
  try {
    const { error } = await supabase
      .from('event_expenses')
      .delete()
      .eq('id', expenseId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Erro ao deletar gasto:', err);
    throw err;
  }
};

/* ================================
   EQUIPE DE SEGURANÇA
================================ */

const loadSecurityTeam = async () => {
  try {
    const { data, error } = await supabase
      .from('security_team')
      .select('*')
      .eq('active', true)
      .order('name', { ascending: true });

    if (error) throw error;

    return (data || []).map(emp => ({
      id: emp.id,
      name: emp.name,
      position: emp.position,
      phone: emp.phone,
      email: emp.email,
      active: emp.active,
      createdAt: new Date(emp.created_at).toLocaleString('pt-BR')
    }));
  } catch (err) {
    console.error('Erro ao carregar equipe:', err);
    throw err;
  }
};

const addSecurityEmployee = async (employeeData) => {
  try {
    const { data, error } = await supabase
      .from('security_team')
      .insert({
        name: normalizeText(employeeData.name),
        position: normalizeText(employeeData.position),
        phone: normalizeText(employeeData.phone),
        email: normalizeText(employeeData.email),
        active: true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Erro ao adicionar funcionário:', err);
    throw err;
  }
};

const updateSecurityEmployee = async (employeeId, employeeData) => {
  try {
    const { error } = await supabase
      .from('security_team')
      .update({
        name: normalizeText(employeeData.name),
        position: normalizeText(employeeData.position),
        phone: normalizeText(employeeData.phone),
        email: normalizeText(employeeData.email),
        updated_at: new Date().toISOString()
      })
      .eq('id', employeeId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Erro ao atualizar funcionário:', err);
    throw err;
  }
};

const deleteSecurityEmployee = async (employeeId) => {
  try {
    const { error } = await supabase
      .from('security_team')
      .update({ 
        active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', employeeId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Erro ao remover funcionário:', err);
    throw err;
  }
};

/* ================================
   BANCO DE HORAS
================================ */

const loadHourBank = async (employeeId = null) => {
  try {
    let query = supabase
      .from('hour_bank')
      .select(`
        *,
        security_team (id, name, position),
        events (id, name, category)
      `)
      .order('event_date', { ascending: false });

    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map(hb => ({
      id: hb.id,
      employeeId: hb.employee_id,
      employeeName: hb.security_team?.name,
      employeePosition: hb.security_team?.position,
      eventId: hb.event_id,
      eventName: hb.events?.name,
      eventCategory: hb.events?.category,
      eventDate: hb.event_date,
      hoursWorked: hb.hours_worked,
      notes: hb.notes,
      createdAt: new Date(hb.created_at).toLocaleString('pt-BR')
    }));
  } catch (err) {
    console.error('Erro ao carregar banco de horas:', err);
    throw err;
  }
};

const addHourBank = async (hourData) => {
  try {
    const { data, error } = await supabase
      .from('hour_bank')
      .insert({
        employee_id: hourData.employeeId,
        event_id: hourData.eventId || null,
        event_date: hourData.eventDate,
        hours_worked: hourData.hoursWorked,
        notes: normalizeText(hourData.notes)
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Erro ao registrar horas:', err);
    throw err;
  }
};

const updateHourBank = async (hourId, hourData) => {
  try {
    const { error } = await supabase
      .from('hour_bank')
      .update({
        employee_id: hourData.employeeId,
        event_id: hourData.eventId || null,
        event_date: hourData.eventDate,
        hours_worked: hourData.hoursWorked,
        notes: normalizeText(hourData.notes),
        updated_at: new Date().toISOString()
      })
      .eq('id', hourId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Erro ao atualizar horas:', err);
    throw err;
  }
};

const deleteHourBank = async (hourId) => {
  try {
    const { error } = await supabase
      .from('hour_bank')
      .delete()
      .eq('id', hourId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Erro ao deletar horas:', err);
    throw err;
  }
};

const loadHourBankSummary = async () => {
  try {
    const { data, error } = await supabase
      .from('v_hour_bank_summary')
      .select('*')
      .order('total_hours', { ascending: false });

    if (error) throw error;

    return (data || []).map(row => ({
      employeeId: row.employee_id,
      employeeName: row.employee_name,
      position: row.position,
      active: row.active,
      totalHours: row.total_hours,
      totalEvents: row.total_events,
      lastEventDate: row.last_event_date
    }));
  } catch (err) {
    console.error('Erro ao carregar resumo de horas:', err);
    throw err;
  }
};

// ============================================
// CÁLCULO DE ESCALA ATUAL (12x36)
// ============================================
const getCurrentSchedule = (hireDate, initialSchedule) => {
  if (!hireDate || !initialSchedule) return initialSchedule;

  const hire = new Date(hireDate + 'T12:00:00');
  const now = new Date();
  
  // Conta quantos meses de 31 dias passaram desde a admissão
  let alternations = 0;
  let current = new Date(hire);

  while (current < now) {
    const year = current.getFullYear();
    const month = current.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    
    // Se o mês tem 31 dias, alterna
    if (lastDay === 31) {
      alternations++;
    }
    
    // Avança para o próximo mês
    current.setMonth(current.getMonth() + 1);
  }

  // Se número de alternações for ímpar, inverte a escala
  if (alternations % 2 === 1) {
    return initialSchedule === 'Dias Pares' ? 'Dias Ímpares' : 'Dias Pares';
  }
  
  return initialSchedule;
};

// ============================================
// STAFF (Pessoal Operacional)
// ============================================
const loadStaff = async () => {
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .is('deleted_at', null)
    .order('name');

  if (error) throw error;

  return (data || []).map(s => ({
    ...s,
    createdAt: s.created_at ? new Date(s.created_at).toLocaleString('pt-BR') : null,
    updatedAt: s.updated_at ? new Date(s.updated_at).toLocaleString('pt-BR') : null,
    // Calcula escala atual para operacionais (baseado em meses de 31 dias)
    current_schedule: s.team_type === 'operacional'
      ? getCurrentSchedule(s.hire_date, s.current_schedule)
      : s.current_schedule
  }));
};

const addStaff = async (staffData) => {
  const { data, error } = await supabase
    .from('staff')
    .insert([staffData])
    .select()
    .single();
  if (error) throw error;
  return data;
};

const updateStaff = async (staffId, staffData) => {
  const { data, error } = await supabase
    .from('staff')
    .update(staffData)
    .eq('id', staffId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

const deleteStaff = async (staffId) => {
  const { error } = await supabase
    .from('staff')
    .update({ deleted_at: new Date().toISOString(), active: false })
    .eq('id', staffId);
  if (error) throw error;
};

// ============================================
// STAFF VACATIONS
// ============================================
const loadStaffVacations = async (staffId = null) => {
  let query = supabase
    .from('staff_vacations')
    .select(`*, staff:staff_id (id, name, position, post_location)`)
    .order('acquisition_start', { ascending: false });
  if (staffId) query = query.eq('staff_id', staffId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

const addStaffVacation = async (vacationData) => {
  const { data, error } = await supabase
    .from('staff_vacations')
    .insert([vacationData])
    .select()
    .single();
  if (error) throw error;
  return data;
};

const updateStaffVacation = async (vacationId, vacationData) => {
  const { data, error } = await supabase
    .from('staff_vacations')
    .update(vacationData)
    .eq('id', vacationId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

const deleteStaffVacation = async (vacationId) => {
  const { error } = await supabase
    .from('staff_vacations')
    .delete()
    .eq('id', vacationId);
  if (error) throw error;
};

// ============================================
// STAFF SHIFT SWAPS
// ============================================
const loadStaffShiftSwaps = async () => {
  const { data, error } = await supabase
    .from('staff_shift_swaps')
    .select(`*, requester:requester_id (id, name, position), target:target_id (id, name, position)`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

const addStaffShiftSwap = async (swapData) => {
  const { data, error } = await supabase
    .from('staff_shift_swaps')
    .insert([swapData])
    .select()
    .single();
  if (error) throw error;
  return data;
};

const updateStaffShiftSwap = async (swapId, swapData) => {
  const { data, error } = await supabase
    .from('staff_shift_swaps')
    .update(swapData)
    .eq('id', swapId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

const deleteStaffShiftSwap = async (swapId) => {
  const { error } = await supabase
    .from('staff_shift_swaps')
    .delete()
    .eq('id', swapId);
  if (error) throw error;
};

// ============================================
// STAFF ABSENCES
// ============================================
const loadStaffAbsences = async (staffId = null) => {
  let query = supabase
    .from('staff_absences')
    .select(`*, staff:staff_id (id, name, position)`)
    .order('start_date', { ascending: false });
  if (staffId) query = query.eq('staff_id', staffId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

const addStaffAbsence = async (absenceData) => {
  const { data, error } = await supabase
    .from('staff_absences')
    .insert([absenceData])
    .select()
    .single();
  if (error) throw error;
  return data;
};

const updateStaffAbsence = async (absenceId, absenceData) => {
  const { data, error } = await supabase
    .from('staff_absences')
    .update(absenceData)
    .eq('id', absenceId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

const deleteStaffAbsence = async (absenceId) => {
  const { error } = await supabase
    .from('staff_absences')
    .delete()
    .eq('id', absenceId);
  if (error) throw error;
};

/* ================================
   FÉRIAS / COBERTURA DE POSTO
================================ */

const loadVacationExpenses = async () => {
  try {
    const { data, error } = await supabase
      .from('vacation_expenses')
      .select('*')
      .order('start_date', { ascending: false });

    if (error) throw error;

    return (data || []).map(v => ({
      id: v.id,
      position: v.position,
      postLocation: v.post_location,
      startDate: v.start_date,
      endDate: v.end_date,
      totalDays: v.total_days,
      workSchedule: v.work_schedule,
      dailyRate: v.daily_rate,
      totalValue: v.total_value,
      employeeOnVacation: v.employee_on_vacation,
      notes: v.notes,
      createdAt: new Date(v.created_at).toLocaleString('pt-BR')
    }));
  } catch (err) {
    console.error('Erro ao carregar férias:', err);
    throw err;
  }
};

const addVacationExpense = async (vacationData) => {
  try {
    const totalValue = (vacationData.totalDays || 0) * (vacationData.dailyRate || 0);

    const { data, error } = await supabase
      .from('vacation_expenses')
      .insert({
        position: vacationData.position,
        post_location: normalizeText(vacationData.postLocation),
        start_date: vacationData.startDate,
        end_date: vacationData.endDate,
        total_days: vacationData.totalDays,
        work_schedule: vacationData.workSchedule,
        daily_rate: vacationData.dailyRate,
        total_value: totalValue,
        employee_on_vacation: normalizeText(vacationData.employeeOnVacation),
        notes: normalizeText(vacationData.notes)
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Erro ao adicionar férias:', err);
    throw err;
  }
};

const updateVacationExpense = async (vacationId, vacationData) => {
  try {
    const totalValue = (vacationData.totalDays || 0) * (vacationData.dailyRate || 0);

    const { error } = await supabase
      .from('vacation_expenses')
      .update({
        position: vacationData.position,
        post_location: normalizeText(vacationData.postLocation),
        start_date: vacationData.startDate,
        end_date: vacationData.endDate,
        total_days: vacationData.totalDays,
        work_schedule: vacationData.workSchedule,
        daily_rate: vacationData.dailyRate,
        total_value: totalValue,
        employee_on_vacation: normalizeText(vacationData.employeeOnVacation),
        notes: normalizeText(vacationData.notes),
        updated_at: new Date().toISOString()
      })
      .eq('id', vacationId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Erro ao atualizar férias:', err);
    throw err;
  }
};

const deleteVacationExpense = async (vacationId) => {
  try {
    const { error } = await supabase
      .from('vacation_expenses')
      .delete()
      .eq('id', vacationId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Erro ao deletar férias:', err);
    throw err;
  }
};

/* ================================
   ROLES E PERMISSÕES
================================ */

// Cache do role pra não ficar consultando o banco toda hora
let _cachedRole = null;
let _cachedRoleTimestamp = 0;
const ROLE_CACHE_TTL = 60000; // 1 minuto

const getUserRole = async () => {
  try {
    // Retorna cache se ainda válido
    const now = Date.now();
    if (_cachedRole && (now - _cachedRoleTimestamp) < ROLE_CACHE_TTL) {
      return _cachedRole;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_roles')
      .select('role, active')
      .eq('user_id', user.id)
      .single();
    
    if (error || !data?.active) {
      _cachedRole = 'operador';
      _cachedRoleTimestamp = now;
      return 'operador'; // fallback seguro
    }

    _cachedRole = data.role;
    _cachedRoleTimestamp = now;
    return data.role;
  } catch {
    return 'operador';
  }
};

const getUserEmail = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.email || '';
  } catch {
    return '';
  }
};

const isAdmin = async () => {
  const role = await getUserRole();
  return role === 'admin';
};

// Limpa cache quando faz logout ou troca de usuário
const clearRoleCache = () => {
  _cachedRole = null;
  _cachedRoleTimestamp = 0;
};

// Gerenciamento de usuários (só admin pode usar via RLS)
const loadUsers = async () => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('*')
    .order('email');
  if (error) throw error;
  return data || [];
};

const updateUserRole = async (userId, role) => {
  const { error } = await supabase
    .from('user_roles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
  if (error) throw error;
  return true;
};

const toggleUserActive = async (userId, active) => {
  const { error } = await supabase
    .from('user_roles')
    .update({ active, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
  if (error) throw error;
  return true;
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
  updateLoan,
  updateLoanStatus,
  updateLoanItemReturn,
  deleteLoan,
  getNextDocumentNumber,
  registerDocumentNumber,
  loadEvents,
  addEvent,
  updateEvent,
  deleteEvent,
  addEventExpense,
  updateEventExpense,
  deleteEventExpense,
  loadSecurityTeam,
  addSecurityEmployee,
  updateSecurityEmployee,
  deleteSecurityEmployee,
  loadHourBank,
  addHourBank,
  updateHourBank,
  deleteHourBank,
  loadHourBankSummary,
  loadVacationExpenses,
  addVacationExpense,
  updateVacationExpense,
  deleteVacationExpense,
  // Staff operacional
  loadStaff,
  addStaff,
  updateStaff,
  deleteStaff,
  loadStaffVacations,
  addStaffVacation,
  updateStaffVacation,
  deleteStaffVacation,
  loadStaffShiftSwaps,
  addStaffShiftSwap,
  updateStaffShiftSwap,
  deleteStaffShiftSwap,
  loadStaffAbsences,
  addStaffAbsence,
  updateStaffAbsence,
  deleteStaffAbsence,
  // Roles e permissões
  getUserRole,
  getUserEmail,
  isAdmin,
  clearRoleCache,
  loadUsers,
  updateUserRole,
  toggleUserActive,
};