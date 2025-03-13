local isDead = false
local isUIVisible = false

local function showBillsMenu()
    ESX.TriggerServerCallback('esx_billing:getBills', function(bills)
        -- if #bills <= 0 then
        --     ESX.ShowNotification(TranslateCap('no_invoices'))
        --     return
        -- end

        SendNUIMessage({
            type = 'SHOW_BILLS',
            bills = bills
        })

        SetNuiFocus(true, true)
        isUIVisible = true
    end)
end

RegisterCommand('showbills', function()
    if not isDead then
        showBillsMenu()
    end
end, false)

RegisterKeyMapping('showbills', TranslateCap('keymap_showbills'), 'keyboard', 'F7')

AddEventHandler('esx:onPlayerDeath', function() isDead = true end)
AddEventHandler('esx:onPlayerSpawn', function() isDead = false end)

RegisterNUICallback('closeUI', function(data, cb)
    SetNuiFocus(false, false)
    isUIVisible = false
    SendNUIMessage({ type = 'HIDE_BILLS' })
    cb('ok')
end)

RegisterNUICallback('payBill', function(data, cb)
    ESX.TriggerServerCallback('esx_billing:payBill', function(resp)
        cb({ success = resp })
    end, data.billId)
end)