'use client'

import ButtonLoading from '@/components/Application/ButtonLoading'
import Select from '@/components/Application/Select'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { showToast } from '@/lib/showToast'
import { zSchema } from '@/lib/zodSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import React, { useMemo, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import slugify from 'slugify'

const emptyAttribute = () => ({ label: '', presets: [], allowCustom: true, _presetInput: '' })

const toFormAttributes = (attrs = []) =>
  attrs.map((a) => ({
    label: a.label || '',
    presets: a.presets || [],
    allowCustom: a.allowCustom !== false,
    _presetInput: '',
  }))

const getParentId = (cat) => (cat?.parent ? String(cat.parent._id ?? cat.parent) : null)

/**
 * Add aur Edit dono ke liye same UI.
 *  mode: 'add' | 'edit'
 *  id: edit ke time category ka _id
 *  initialData: edit ke time category ka data
 *  allCategories: /api/category/get-category ka poora data
 */
const CategoryForm = ({ mode = 'add', id = null, initialData = null, allCategories = [] }) => {
  const isEdit = mode === 'edit'

  const [loading, setLoading] = useState(false)
  const [categoryType, setCategoryType] = useState(initialData?.parent ? 'sub' : 'top')
  const [attributes, setAttributes] = useState(toFormAttributes(initialData?.attributes))

  // edit me load hone ke baad slug apne aap overwrite na ho
  const loadedName = useRef(initialData?.name ?? null)

  // sirf top-level categories parent ban sakti hain (khud ko chhod kar)
  const parentOption = useMemo(
    () =>
      allCategories
        .filter((cat) => !getParentId(cat) && String(cat._id) !== String(id))
        .map((cat) => ({ label: cat.name, value: cat._id })),
    [allCategories, id]
  )

  // Jis category ke andar sub-categories hain wo khud sub-category nahi ban sakti (2 level hi allowed)
  const hasChildren = useMemo(
    () => isEdit && allCategories.some((cat) => getParentId(cat) === String(id)),
    [isEdit, allCategories, id]
  )

  const formSchema = zSchema.pick({ name: true, slug: true })

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      parent: initialData?.parent ? String(initialData.parent) : '',
    },
  })

  const watchedName = form.watch('name')
  useEffect(() => {
    if (watchedName && watchedName !== loadedName.current) {
      form.setValue('slug', slugify(watchedName).toLowerCase())
    }
  }, [watchedName])

  // ===== Attribute builder helpers =====
  const addAttributeRow = () => setAttributes((prev) => [...prev, emptyAttribute()])
  const removeAttributeRow = (index) => setAttributes((prev) => prev.filter((_, i) => i !== index))
  const updateAttributeField = (index, field, value) =>
    setAttributes((prev) => prev.map((attr, i) => (i === index ? { ...attr, [field]: value } : attr)))

  const addPresetValue = (index) => {
    setAttributes((prev) =>
      prev.map((attr, i) => {
        if (i !== index) return attr
        const newPreset = attr._presetInput.trim()
        if (!newPreset) return attr
        if (attr.presets.includes(newPreset)) return { ...attr, _presetInput: '' }
        return { ...attr, presets: [...attr.presets, newPreset], _presetInput: '' }
      })
    )
  }

  const removePresetValue = (index, presetToRemove) =>
    setAttributes((prev) =>
      prev.map((attr, i) =>
        i === index ? { ...attr, presets: attr.presets.filter((p) => p !== presetToRemove) } : attr
      )
    )

  const switchType = (type) => {
    setCategoryType(type)
    form.setValue('parent', '')
    if (type === 'top') setAttributes([])
  }

  const onSubmit = async (values) => {
    setLoading(true)
    try {
      // NOTE: zod schema me parent nahi hai, isliye values.parent strip ho jata hai.
      // Isi wajah se getValues use kiya hai.
      const parent = form.getValues('parent')

      if (categoryType === 'sub' && !parent) {
        showToast('error', 'Please select a parent category.')
        return
      }

      const cleanedAttributes = attributes
        .filter((a) => a.label.trim())
        .map(({ label, presets, allowCustom }) => ({ label: label.trim(), presets, allowCustom }))

      const payload = {
        ...values,
        parent: categoryType === 'sub' ? parent : null,
        attributes: categoryType === 'sub' ? cleanedAttributes : [],
      }

      let response
      if (isEdit) {
        payload._id = id
        response = (await axios.put('/api/category/update', payload)).data
      } else {
        response = (await axios.post('/api/category/create', payload)).data
      }

      if (!response.success) throw new Error(response.message)

      if (!isEdit) {
        form.reset({ name: '', slug: '', parent: '' })
        setAttributes([])
      }
      showToast('success', response.message)
    } catch (error) {
      showToast('error', error?.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="py-0 rounded-3xl shadow-sm ">
      <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
        <h4 className="text-xl font-semibold">{isEdit ? 'Edit Category' : 'Add Category'}</h4>
      </CardHeader>
      <CardContent className="pb-5">
        <div className="mt-5">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {/* Top-level vs Subcategory */}
              <div className="mb-5">
                <FormLabel className="mb-2 block">
                  {isEdit ? 'Category type' : 'What are you adding?'}
                </FormLabel>
                <div className="flex gap-3">
                  {[
                    { key: 'top', label: 'Top-level Category', disabled: false },
                    { key: 'sub', label: 'Subcategory', disabled: hasChildren },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      disabled={opt.disabled}
                      onClick={() => switchType(opt.key)}
                      className={cn(
                        'px-4 py-2 rounded-lg border text-sm font-medium transition-colors',
                        opt.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                        categoryType === opt.key
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-orange-300'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {hasChildren
                    ? 'This category already has sub-categories, so it must stay top-level.'
                    : categoryType === 'top'
                    ? 'e.g. "Civil & Interiors" — a broad group shown in the main menu.'
                    : 'e.g. "Cement" — sits inside a top-level category, products get linked here.'}
                </p>
              </div>

              {/* Parent picker */}
              {categoryType === 'sub' && (
                <div className="mb-5">
                  <FormField
                    control={form.control}
                    name="parent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Parent Category<span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Select
                            options={parentOption}
                            selected={field.value}
                            setSelected={field.onChange}
                            isMulti={false}
                            placeholder="Select a top-level category"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <div className="mb-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder={categoryType === 'sub' ? 'e.g. Cement' : 'e.g. Civil & Interiors'}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mb-5">
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="Enter slug" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* ===== Variant Options — sirf Subcategory ke liye ===== */}
              {categoryType === 'sub' && (
                <div className="mb-5 rounded-2xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <FormLabel className="block">
                        Variant Options (Size / Weight / Diameter / Color...)
                      </FormLabel>
                      <p className="text-xs text-gray-500 mt-1">
                        Define what options Shopowners will pick from when adding products under this
                        subcategory — e.g. Cement → "Weight" with 25kg, 50kg presets. Optional.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addAttributeRow}
                      className="shrink-0 px-3 py-1.5 rounded-lg border border-orange-400 text-yellow-500 text-sm font-medium hover:bg-orange-50 cursor-pointer"
                    >
                      + Add Option
                    </button>
                  </div>

                  {attributes.length === 0 && <p className="text-sm text-gray-400">No options added yet.</p>}

                  <div className="space-y-4">
                    {attributes.map((attr, index) => (
                      <div key={index} className="rounded-xl border border-gray-200 p-3 bg-gray-50">
                        <div className="flex items-center gap-3 mb-3">
                          <Input
                            placeholder="Option name — e.g. Weight, Diameter, Color"
                            value={attr.label}
                            onChange={(e) => updateAttributeField(index, 'label', e.target.value)}
                            className="bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => removeAttributeRow(index)}
                            className="shrink-0 h-9 w-9 flex items-center justify-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50 cursor-pointer"
                            title="Remove this option"
                          >
                            ×
                          </button>
                        </div>

                        <div className="mb-2">
                          <p className="text-xs font-medium text-gray-600 mb-1">Preset values (optional)</p>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {attr.presets.map((preset) => (
                              <span
                                key={preset}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-xs"
                              >
                                {preset}
                                <button
                                  type="button"
                                  onClick={() => removePresetValue(index, preset)}
                                  className="hover:text-red-500 cursor-pointer"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Input
                              placeholder="e.g. 25kg — press Enter to add"
                              value={attr._presetInput}
                              onChange={(e) => updateAttributeField(index, '_presetInput', e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  addPresetValue(index)
                                }
                              }}
                              className="bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => addPresetValue(index)}
                              className="shrink-0 px-3 rounded-lg border border-gray-300 text-sm text-gray-600 hover:border-orange-300 cursor-pointer"
                            >
                              Add
                            </button>
                          </div>
                        </div>

                        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={attr.allowCustom}
                            onChange={(e) => updateAttributeField(index, 'allowCustom', e.target.checked)}
                          />
                          Allow Shopowners to type a custom value too (not just presets)
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <ButtonLoading
                loading={loading}
                type="submit"
                text={isEdit ? 'Update Category' : '+ Add Category'}
                className="bg-[#fff0ea] cursor-pointer text-orange-400 font-mono hover:bg-orange-500 hover:text-white"
              />
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  )
}

export default CategoryForm