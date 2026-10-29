import {act,render,screen,fireEvent} from '@testing-library/react';
import AcademicHistory from '@/components/AcademicHistory';
import api from '@/lib/api';
jest.mock('@/lib/api',()=>({__esModule:true,default:{get:jest.fn()}}));
test('manual and automatic history remain explicitly separated from the official average',async()=>{
 api.get.mockResolvedValue({data:{data:{policy:'automatic_only',automatic:[{id:'a',title:'Automatic activity',source:'automatic',date:'2026-10-28',score:10,maxScore:10,percentage:100}],manual:[{id:'m',title:'External activity',source:'manual',date:'2026-10-28',score:1,maxScore:2,percentage:50,feedback:'Reviewed',history:[{action:'created'}]}]}}});
 render(<AcademicHistory/>);await act(async()=>{await Promise.resolve();});
 expect(screen.getByText('Automatic activity')).toBeInTheDocument();expect(screen.getByText('External activity')).toBeInTheDocument();expect(screen.getByText('Manual')).toBeInTheDocument();expect(screen.getByText(/Manual results are recorded separately/)).toBeInTheDocument();
 expect(screen.queryByText('75%')).not.toBeInTheDocument();fireEvent.click(screen.getByRole('button',{name:'Refresh grades'}));await act(async()=>{await Promise.resolve();});expect(api.get).toHaveBeenCalledWith('/students/grades');
});
