local isDead = false
local isUIVisible = false

local function showBillsMenu()
    ESX.TriggerServerCallback('esx_billing:getBills', function(bills)
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

-- RegisterKeyMapping('showbills', TranslateCap('keymap_showbills'), 'keyboard', 'F7')

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
        if resp then
            showBillsMenu()
        end
        cb({ success = resp })
    end, data.billId)
end)

RegisterNUICallback('getBills', function(data, cb)
    ESX.TriggerServerCallback('esx_billing:getBills', function(bills)
        cb({ bills = bills })
    end)
end)

RegisterNUICallback('getNearby', function(data, cb)
    local closestPlayer, closestDistance = ESX.Game.GetClosestPlayer()

    if closestPlayer == -1 or closestDistance > 3.0 then
        ESX.ShowNotification('There\'s no players nearby!')
    end
        cb({ targetId = GetPlayerServerId(closestPlayer) })
end)

RegisterNUICallback('sendBill', function(data, cb)
    ESX.TriggerServerCallback('esx_billing:getBills', function(bills)
        cb({ bills = bills })
    end)
end)
